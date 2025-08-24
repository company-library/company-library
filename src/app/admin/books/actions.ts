'use server'

import { GOOGLE_BOOK_SEARCH_QUERY, OPENBD_SEARCH_QUERY } from '@/constants'
import prisma from '@/libs/prisma/client'

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
 * 特定の書籍の不足情報を更新するServer Action
 * @param bookId 更新対象の書籍ID
 * @returns 更新結果
 */
export async function updateSingleBookInfo(bookId: number) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book) {
      throw new Error('書籍が見つかりません')
    }

    const updatedInfo = await fetchBookInfo(book.isbn)

    if (!updatedInfo) {
      throw new Error('外部APIから書籍情報を取得できませんでした')
    }

    const updateData: {
      description?: string
      imageUrl?: string
    } = {}

    // 説明文が空の場合のみ更新
    if (book.description === '' && updatedInfo.description) {
      updateData.description = updatedInfo.description
    }

    // 画像URLがnullの場合のみ更新
    if (book.imageUrl === null && updatedInfo.imageUrl) {
      updateData.imageUrl = updatedInfo.imageUrl
    }

    // 更新すべきデータがある場合のみDB更新
    if (Object.keys(updateData).length > 0) {
      const updatedBook = await prisma.book.update({
        where: { id: bookId },
        data: updateData,
      })

      return {
        success: true,
        message: '書籍情報を更新しました',
        updatedFields: Object.keys(updateData),
        book: updatedBook,
      }
    }
    return {
      success: true,
      message: '更新する情報がありませんでした',
      updatedFields: [],
      book,
    }
  } catch (error) {
    console.error('書籍情報更新エラー:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '書籍情報の更新に失敗しました',
    }
  }
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
) {
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
 * Google Books APIとOpenBD APIから書籍情報を取得する
 */
async function fetchBookInfo(isbn: string): Promise<{
  description?: string
  imageUrl?: string
} | null> {
  try {
    // Google Books APIから情報を取得
    const googleResponse = await fetch(`${GOOGLE_BOOK_SEARCH_QUERY}${isbn}`)
    const googleData: GoogleBookResponse = await googleResponse.json()

    const description = googleData.items?.[0]?.volumeInfo?.description
    let imageUrl = googleData.items?.[0]?.volumeInfo?.imageLinks?.thumbnail

    // OpenBD APIからも情報を取得（フォールバック）
    if (!description || !imageUrl) {
      try {
        const openbdResponse = await fetch(`${OPENBD_SEARCH_QUERY}${isbn}`)
        const openbdData: OpenBDResponse = await openbdResponse.json()

        if (!imageUrl && openbdData[0]?.summary?.cover) {
          imageUrl = openbdData[0].summary.cover
        }
      } catch (openbdError) {
        console.warn(`OpenBD API error for ISBN ${isbn}:`, openbdError)
      }
    }

    return {
      description: description || undefined,
      imageUrl: imageUrl || undefined,
    }
  } catch (error) {
    console.error(`書籍情報取得エラー (ISBN: ${isbn}):`, error)
    return null
  }
}
