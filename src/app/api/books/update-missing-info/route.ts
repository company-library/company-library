import { NextResponse } from 'next/server'
import { GOOGLE_BOOK_SEARCH_QUERY, OPENBD_SEARCH_QUERY } from '@/constants'
import prisma from '@/libs/prisma/client'
import { downloadAndPutImage } from '@/libs/vercel/downloadAndPutImage'
import type { CustomError } from '@/models/errors'

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
 * 書籍の不足している情報（説明文、画像URL）を外部APIから取得して更新する
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number.parseInt(searchParams.get('limit') || '20', 10), 50) // 最大50件に変更
    const filter = searchParams.get('filter') || 'both' // 'description', 'image', 'both'
    const createdAfter = searchParams.get('createdAfter')
    const createdBefore = searchParams.get('createdBefore')
    // 作成日の新しい順で固定
    const sortBy = 'createdAt'
    const sortOrder = 'desc'

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

    // 説明文が空または画像URLがnullの書籍を取得（上限付き）
    const booksToUpdate = await prisma.book.findMany({
      where: {
        AND: whereConditions,
      },
      take: limit, // 最大50件まで
      orderBy: {
        [sortBy]: sortOrder,
      },
    })

    if (booksToUpdate.length === 0) {
      return NextResponse.json({
        message: '更新対象の書籍が見つかりませんでした',
        updatedCount: 0,
        totalProcessed: 0,
        noUpdateCount: 0,
        errorCount: 0,
        updatedIsbns: [],
        noUpdateIsbns: [],
        errorIsbns: [],
        results: [],
      })
    }

    const results = []
    let updatedCount = 0
    let noUpdateCount = 0
    let errorCount = 0
    const updatedIsbns: string[] = []
    const noUpdateIsbns: string[] = []
    const errorIsbns: string[] = []

    for (const book of booksToUpdate) {
      try {
        const updatedInfo = await fetchBookInfo(book.isbn)

        if (updatedInfo) {
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
            await prisma.book.update({
              where: { id: book.id },
              data: updateData,
            })
            updatedCount++
            updatedIsbns.push(book.isbn)
            results.push({
              id: book.id,
              isbn: book.isbn,
              title: book.title,
              updated: updateData,
            })
          } else {
            // 更新する情報がなかった場合
            noUpdateCount++
            noUpdateIsbns.push(book.isbn)
            results.push({
              id: book.id,
              isbn: book.isbn,
              title: book.title,
            })
          }
        } else {
          // APIから情報を取得できなかった場合
          noUpdateCount++
          noUpdateIsbns.push(book.isbn)
          results.push({
            id: book.id,
            isbn: book.isbn,
            title: book.title,
          })
        }

        // API rate limiting のため少し待機（200msに拡大）
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`書籍ID ${book.id} の更新中にエラーが発生:`, error)
        errorCount++
        errorIsbns.push(book.isbn)
        results.push({
          id: book.id,
          isbn: book.isbn,
          title: book.title,
          error: 'Update failed',
        })
      }
    }

    return NextResponse.json({
      message: `${updatedCount}件の書籍情報を更新しました`,
      updatedCount,
      totalProcessed: booksToUpdate.length,
      noUpdateCount,
      errorCount,
      updatedIsbns,
      noUpdateIsbns,
      errorIsbns,
      results,
    })
  } catch (error) {
    console.error('書籍情報更新エラー:', error)
    const customError: CustomError = {
      errorCode: '500',
      message: '書籍情報の更新に失敗しました',
    }
    return NextResponse.json(customError, { status: 500 })
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
