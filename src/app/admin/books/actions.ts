'use server'

import { GOOGLE_BOOK_SEARCH_QUERY, OPENBD_SEARCH_QUERY } from '@/constants'
import prisma from '@/libs/prisma/client'
import { downloadAndPutImage } from '@/libs/vercel/downloadAndPutImage'

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
      const vercelBlobUrl = await downloadAndPutImage(updatedInfo.imageUrl, book.isbn)
      if (vercelBlobUrl) {
        updateData.imageUrl = vercelBlobUrl
      }
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
 * @param sortBy ソートフィールド
 * @param sortOrder ソート順序
 * @returns 書籍一覧
 */
export async function getBooksWithMissingInfo(
  limit = 20,
  sortBy: 'createdAt' | 'title' | 'isbn' | 'registrationCount' = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'asc',
) {
  try {
    // registrationCountでソートする場合は別のクエリが必要
    if (sortBy === 'registrationCount') {
      const books = await prisma.book.findMany({
        where: {
          OR: [{ description: '' }, { imageUrl: null }],
        },
        take: Math.min(limit, 100),
        include: {
          _count: {
            select: {
              registrationHistories: true,
            },
          },
        },
      })

      // メモリ上でソート
      const sortedBooks = books.sort((a, b) => {
        const aCount = a._count.registrationHistories
        const bCount = b._count.registrationHistories
        return sortOrder === 'asc' ? aCount - bCount : bCount - aCount
      })

      return {
        success: true,
        books: sortedBooks,
        count: sortedBooks.length,
      }
    }

    const books = await prisma.book.findMany({
      where: {
        OR: [{ description: '' }, { imageUrl: null }],
      },
      take: Math.min(limit, 100),
      orderBy: {
        [sortBy]: sortOrder,
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
