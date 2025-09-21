'use server'

import { GOOGLE_BOOK_SEARCH_QUERY, OPENBD_SEARCH_QUERY } from '@/constants'
import prisma from '@/libs/prisma/client'
import { downloadAndPutImage } from '@/libs/vercel/downloadAndPutImage'
import type { Book } from '@/models/book'

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
      console.warn(`Google Books API error for ISBN ${isbn}:`, googleError)
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
      console.warn(`OpenBD API error for ISBN ${isbn}:`, openbdError)
      return { description: undefined, imageUrl: undefined }
    })

  // Google Booksのデータを優先し、不足分をOpenBDで補完
  const description = googleData.description || openbdData.description
  const imageUrl = googleData.imageUrl || openbdData.imageUrl

  // 両方のAPIから何も取得できなかった場合
  if (!description && !imageUrl) {
    console.error(`書籍情報取得エラー: 両方のAPIから情報を取得できませんでした (ISBN: ${isbn})`)
    return null
  }

  return {
    description,
    imageUrl,
  }
}

/**
 * 書籍情報を更新するヘルパー関数
 */
export async function updateBookInfo(book: Book): Promise<{
  updated: { description?: string; imageUrl?: string } | null
  book: Book
}> {
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

  // 更新する情報がない場合はスキップ
  if (Object.keys(updateData).length === 0) {
    return { updated: null, book }
  }

  const updatedBook = await prisma.book.update({
    where: { id: book.id },
    data: updateData,
  })
  return { updated: updateData, book: updatedBook }
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
 * 書籍の不足情報を更新する統合Server Action
 * 単一書籍または複数書籍の更新に対応
 */
export async function updateBooksInfo({
  bookIds,
}: {
  bookIds?: number[]
}): Promise<UpdateBooksInfoResult> {
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

    // 単一書籍の場合の特別処理
    if (bookIds && bookIds.length === 1) {
      const book = booksToUpdate[0]
      if (!book) {
        return {
          success: false,
          message: '書籍が見つかりません',
          updatedIsbns: [],
          noUpdateIsbns: [],
          errorIsbns: [],
          results: [],
          updatedFields: [],
        }
      }

      try {
        const result = await updateBookInfo(book)
        if (!result) {
          return {
            success: false,
            message: '外部APIから書籍情報を取得できませんでした',
            updatedIsbns: [],
            noUpdateIsbns: [],
            errorIsbns: [],
            results: [],
            updatedFields: [],
          }
        }

        return {
          success: true,
          message: result.updated ? '書籍情報を更新しました' : '更新する情報がありませんでした',
          updatedIsbns: result.updated ? [book.isbn] : [],
          noUpdateIsbns: result.updated ? [] : [book.isbn],
          errorIsbns: [],
          results: [
            {
              id: book.id,
              isbn: book.isbn,
              title: book.title,
              updated: result.updated || undefined,
            },
          ],
          updatedFields: result.updated ? Object.keys(result.updated) : [],
        }
      } catch (error) {
        console.error(`書籍ID ${book.id} の更新中にエラーが発生:`, error)
        return {
          success: false,
          message: error instanceof Error ? error.message : '書籍情報の更新に失敗しました',
          updatedIsbns: [],
          noUpdateIsbns: [],
          errorIsbns: [book.isbn],
          results: [
            {
              id: book.id,
              isbn: book.isbn,
              title: book.title,
              error: 'Update failed',
            },
          ],
          updatedFields: [],
        }
      }
    }

    // 複数書籍の処理
    const updatedIsbns: string[] = []
    const noUpdateIsbns: string[] = []
    const errorIsbns: string[] = []
    const results = []

    for (const book of booksToUpdate) {
      try {
        const result = await updateBookInfo(book)
        if (result) {
          if (result.updated) {
            updatedIsbns.push(book.isbn)
            results.push({
              id: book.id,
              isbn: book.isbn,
              title: book.title,
              updated: result.updated,
            })
          } else {
            noUpdateIsbns.push(book.isbn)
            results.push({
              id: book.id,
              isbn: book.isbn,
              title: book.title,
            })
          }
        } else {
          noUpdateIsbns.push(book.isbn)
          results.push({
            id: book.id,
            isbn: book.isbn,
            title: book.title,
          })
        }

        // API rate limiting のため待機
        if (booksToUpdate.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
      } catch (error) {
        console.error(`書籍ID ${book.id} の更新中にエラーが発生:`, error)
        errorIsbns.push(book.isbn)
        results.push({
          id: book.id,
          isbn: book.isbn,
          title: book.title,
          error: 'Update failed',
        })
      }
    }

    return {
      success: true,
      message: `${updatedIsbns.length}件の書籍情報を更新しました`,
      updatedIsbns,
      noUpdateIsbns,
      errorIsbns,
      results,
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
    const dateConditions: Record<string, Date> = {}
    if (createdAfter) {
      try {
        const date = new Date(createdAfter)
        if (!Number.isNaN(date.getTime())) {
          dateConditions.gte = date
        }
      } catch {
        // 無効な日付は無視
      }
    }
    if (createdBefore) {
      try {
        const date = new Date(createdBefore)
        if (!Number.isNaN(date.getTime())) {
          // 終了日は翌日の00:00:00を指定（その日の23:59:59まで含む）
          const endDate = new Date(date)
          endDate.setDate(endDate.getDate() + 1)
          dateConditions.lt = endDate
        }
      } catch {
        // 無効な日付は無視
      }
    }
    if (Object.keys(dateConditions).length > 0) {
      whereConditions.push({ createdAt: dateConditions })
    }

    // 更新日フィルタ
    const updatedDateConditions: Record<string, Date> = {}
    if (updatedAfter) {
      try {
        const date = new Date(updatedAfter)
        if (!Number.isNaN(date.getTime())) {
          updatedDateConditions.gte = date
        }
      } catch {
        // 無効な日付は無視
      }
    }
    if (updatedBefore) {
      try {
        const date = new Date(updatedBefore)
        if (!Number.isNaN(date.getTime())) {
          // 終了日は翌日の00:00:00を指定（その日の23:59:59まで含む）
          const endDate = new Date(date)
          endDate.setDate(endDate.getDate() + 1)
          updatedDateConditions.lt = endDate
        }
      } catch {
        // 無効な日付は無視
      }
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

/**
 * 特定の書籍の不足情報を更新するServer Action
 * @param bookId 更新対象の書籍ID
 * @returns 更新結果
 */
export async function updateSingleBookInfo(bookId: number): Promise<UpdateBooksInfoResult> {
  return updateBooksInfo({ bookIds: [bookId] })
}

/**
 * 特定の書籍IDsの不足情報を更新するServer Action
 */
export async function updateSelectedBooksInfo(bookIds: number[]): Promise<UpdateBooksInfoResult> {
  return updateBooksInfo({ bookIds })
}
