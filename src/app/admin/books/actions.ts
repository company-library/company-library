'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { GOOGLE_BOOK_SEARCH_QUERY, OPENBD_SEARCH_QUERY } from '@/constants'
import prisma from '@/libs/prisma/client'
import { downloadAndPutImage } from '@/libs/vercel/downloadAndPutImage'
import type { Book } from '@/models/book'
import { validateDate } from '@/utils/dateUtils'

type GoogleBookResponse = {
  items?: Array<{
    volumeInfo?: {
      title?: string
      description?: string
      imageLinks?: {
        thumbnail?: string
      }
    }
  }>
}

type OpenBDResponse = Array<{
  summary: {
    title?: string
    cover?: string
  }
} | null>

/**
 * Google Books APIとOpenBD APIから書籍情報を取得する
 */
export async function fetchBookInfo(isbn: string): Promise<{
  description?: string
  imageUrl?: string
} | null> {
  // まずGoogle Books APIから情報を取得
  const googleData = await fetch(`${GOOGLE_BOOK_SEARCH_QUERY}${isbn}`)
    .then((response) => response.json())
    .then((googleData: GoogleBookResponse) => ({
      description: googleData.items?.[0]?.volumeInfo?.description,
      imageUrl: googleData.items?.[0]?.volumeInfo?.imageLinks?.thumbnail,
    }))
    .catch((googleError) => {
      console.warn('Google Books API error for ISBN', isbn, ':', googleError)
      return { description: undefined, imageUrl: undefined }
    })

  // Google Books APIで十分な情報が取得できた場合はそのまま返す
  if (googleData.description && googleData.imageUrl) {
    return {
      description: googleData.description,
      imageUrl: googleData.imageUrl,
    }
  }

  // 不足している情報がある場合のみOpenBD APIを呼び出し
  const openbdData = await fetch(`${OPENBD_SEARCH_QUERY}${isbn}`)
    .then((response) => response.json())
    .then((openbdData: OpenBDResponse) => ({
      description: undefined, // OpenBDには詳細な説明文がないことが多い
      imageUrl: openbdData[0]?.summary?.cover,
    }))
    .catch((openbdError) => {
      console.warn('OpenBD API error for ISBN', isbn, ':', openbdError)
      return { description: undefined, imageUrl: undefined }
    })

  // Google Booksのデータを優先し、不足分をOpenBDで補完
  const description = googleData.description || openbdData.description
  const imageUrl = googleData.imageUrl || openbdData.imageUrl

  // 両方のAPIから何も取得できなかった場合
  if (!description && !imageUrl) {
    console.error('書籍情報取得エラー: 両方のAPIから情報を取得できませんでした (ISBN:', isbn, ')')
    return null
  }

  return {
    description,
    imageUrl,
  }
}

type UpdateBooksInfoResult = {
  success: boolean
  message?: string
  updatedIsbns: string[]
  noUpdateIsbns: string[]
  errorIsbns: string[]
  results: Array<{
    id: number
    isbn: string
    title: string
    updated?: { description?: string; imageUrl?: string }
    error?: string
  }>
  // 単一書籍用の互換性フィールド
  updatedFields?: string[]
}

/**
 * 書籍の不足情報を更新するServer Action
 * 複数書籍の一括更新に対応
 */
export async function updateBooksInfo({
  bookIds,
}: {
  bookIds?: number[]
}): Promise<UpdateBooksInfoResult> {
  // 認証チェック
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return {
      success: false,
      message: '認証が必要です',
      updatedIsbns: [],
      noUpdateIsbns: [],
      errorIsbns: [],
      results: [],
    }
  }

  try {
    const booksToUpdate = await prisma.book.findMany({
      where: {
        id: {
          in: bookIds,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            registrationHistories: true,
          },
        },
      },
    })

    if (booksToUpdate.length === 0) {
      return {
        success: true,
        message: '更新対象の書籍が見つかりませんでした',
        updatedIsbns: [],
        noUpdateIsbns: [],
        errorIsbns: [],
        results: [],
        updatedFields: [],
      }
    }

    // 単一書籍用のupdatedFields計算用
    const isSingleBook = booksToUpdate.length === 1

    // 書籍情報を更新するヘルパー関数
    const updateBookInfo = async (book: Book) => {
      const updatedInfo = await fetchBookInfo(book.isbn)
      if (!updatedInfo) {
        return { updated: null, book }
      }

      const descriptionUpdate =
        book.description === '' && updatedInfo.description
          ? { description: updatedInfo.description }
          : {}

      const imageUpdate =
        !updatedInfo.imageUrl || book.imageUrl !== null
          ? {}
          : await downloadAndPutImage(updatedInfo.imageUrl, book.isbn).then((vercelBlobUrl) =>
              vercelBlobUrl ? { imageUrl: vercelBlobUrl } : {},
            )

      const updateData = { ...descriptionUpdate, ...imageUpdate }

      if (Object.keys(updateData).length === 0) {
        return { updated: null, book }
      }

      const updatedBook = await prisma.book.update({
        where: { id: book.id },
        data: updateData,
      })
      return { updated: updateData, book: updatedBook }
    }

    // 複数書籍の処理
    const updatedIsbns: string[] = []
    const noUpdateIsbns: string[] = []
    const errorIsbns: string[] = []
    const results: Array<{
      id: number
      isbn: string
      title: string
      updated?: { description?: string; imageUrl?: string }
      error?: string
    }> = []
    const allUpdatedFields = new Set<string>()

    const processBook = async (book: Book) => {
      const handleSuccess = (result: {
        updated: { description?: string; imageUrl?: string } | null
        book: Book
      }) => {
        if (result.updated) {
          updatedIsbns.push(book.isbn)
          results.push({
            id: book.id,
            isbn: book.isbn,
            title: book.title,
            updated: result.updated,
          })
          // 単一書籍の場合はupdatedFieldsを記録
          if (isSingleBook) {
            for (const field of Object.keys(result.updated)) {
              allUpdatedFields.add(field)
            }
          }
        } else {
          noUpdateIsbns.push(book.isbn)
          results.push({
            id: book.id,
            isbn: book.isbn,
            title: book.title,
          })
        }
      }

      const handleError = (error: unknown) => {
        console.error(`書籍ID ${book.id} の更新中にエラーが発生:`, error)
        errorIsbns.push(book.isbn)
        results.push({
          id: book.id,
          isbn: book.isbn,
          title: book.title,
          error: 'Update failed',
        })
      }

      const addRateLimitDelay = () =>
        booksToUpdate.length > 1
          ? new Promise((resolve) => setTimeout(resolve, 1000))
          : Promise.resolve()

      return updateBookInfo(book)
        .then(handleSuccess)
        .catch(handleError)
        .then(() => addRateLimitDelay())
        .then(() => undefined)
    }

    await booksToUpdate.reduce(
      (promise, book) => promise.then(() => processBook(book)),
      Promise.resolve() as Promise<void>,
    )

    return {
      success: true,
      message: isSingleBook
        ? updatedIsbns.length > 0
          ? '書籍情報を更新しました'
          : '更新する情報がありませんでした'
        : `${updatedIsbns.length}件の書籍情報を更新しました`,
      updatedIsbns,
      noUpdateIsbns,
      errorIsbns,
      results,
      ...(isSingleBook && { updatedFields: Array.from(allUpdatedFields) }),
    }
  } catch (error) {
    console.error('書籍情報更新エラー:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '書籍情報の更新に失敗しました',
      updatedIsbns: [],
      noUpdateIsbns: [],
      errorIsbns: [],
      results: [],
    }
  }
}

type GetBooksWithMissingInfoResult = {
  success: boolean
  books: Book[]
  count: number
  message?: string
}

/**
 * 不足情報のある書籍一覧を取得するServer Action
 * @param limit 取得件数の上限
 * @param filter フィルタ条件 ('description', 'image', 'both')
 * @param createdAfter 作成日開始日
 * @param createdBefore 作成日終了日
 * @param updatedAfter 更新日開始日
 * @param updatedBefore 更新日終了日
 * @returns 書籍一覧（作成日の新しい順）
 */
export async function getBooksWithMissingInfo(
  limit = 50,
  filter: 'description' | 'image' | 'both' = 'both',
  createdAfter?: string,
  createdBefore?: string,
  updatedAfter?: string,
  updatedBefore?: string,
): Promise<GetBooksWithMissingInfoResult> {
  // 認証チェック
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return {
      success: false,
      message: '認証が必要です',
      books: [],
      count: 0,
    }
  }

  try {
    // フィルタ条件を構築
    const whereConditions: Array<Record<string, unknown>> = []

    // フィルタタイプに応じた条件
    if (filter === 'description') {
      whereConditions.push({ description: '' })
    } else if (filter === 'image') {
      whereConditions.push({ imageUrl: null })
    } else {
      // both: 説明文が空 OR 画像URLがnull
      whereConditions.push({ OR: [{ description: '' }, { imageUrl: null }] })
    }

    // 作成日フィルタ
    const validatedCreatedAfter = validateDate(createdAfter)
    const validatedCreatedBefore = validateDate(createdBefore)

    // 日付の妥当性チェック
    if (
      validatedCreatedAfter &&
      validatedCreatedBefore &&
      validatedCreatedAfter > validatedCreatedBefore
    ) {
      return {
        success: false,
        message: '作成日の開始日は終了日より前である必要があります',
        books: [],
        count: 0,
      }
    }

    const dateConditions: Record<string, Date> = {}
    if (validatedCreatedAfter) {
      dateConditions.gte = validatedCreatedAfter
    }
    if (validatedCreatedBefore) {
      const endDate = new Date(validatedCreatedBefore)
      endDate.setDate(endDate.getDate() + 1)
      dateConditions.lt = endDate
    }
    if (Object.keys(dateConditions).length > 0) {
      whereConditions.push({ createdAt: dateConditions })
    }

    // 更新日フィルタ
    const validatedUpdatedAfter = validateDate(updatedAfter)
    const validatedUpdatedBefore = validateDate(updatedBefore)

    // 日付の妥当性チェック
    if (
      validatedUpdatedAfter &&
      validatedUpdatedBefore &&
      validatedUpdatedAfter > validatedUpdatedBefore
    ) {
      return {
        success: false,
        message: '更新日の開始日は終了日より前である必要があります',
        books: [],
        count: 0,
      }
    }

    const updatedDateConditions: Record<string, Date> = {}
    if (validatedUpdatedAfter) {
      updatedDateConditions.gte = validatedUpdatedAfter
    }
    if (validatedUpdatedBefore) {
      const endDate = new Date(validatedUpdatedBefore)
      endDate.setDate(endDate.getDate() + 1)
      updatedDateConditions.lt = endDate
    }
    if (Object.keys(updatedDateConditions).length > 0) {
      whereConditions.push({ updatedAt: updatedDateConditions })
    }

    const books = await prisma.book.findMany({
      where: {
        AND: whereConditions,
      },
      take: Math.min(limit, 100),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            registrationHistories: true,
          },
        },
      },
    })

    return {
      success: true,
      books,
      count: books.length,
    }
  } catch (error) {
    console.error('書籍一覧取得エラー:', error)
    return {
      success: false,
      message: '書籍一覧の取得に失敗しました',
      books: [],
      count: 0,
    }
  }
}
