'use server'

import { redirect } from 'next/navigation'
import { GOOGLE_BOOK_SEARCH_QUERY, OPENBD_SEARCH_QUERY } from '@/constants'
import prisma from '@/libs/prisma/client'
import { notifySlack } from '@/libs/slack/webhook'
import { downloadAndPutImage } from '@/libs/vercel/downloadAndPutImage'

type GoogleBooksResponse = {
  items?: Array<{
    volumeInfo?: {
      imageLinks?: {
        thumbnail?: string
      }
    }
  }>
}

type OpenBDResponse = Array<{
  summary?: {
    cover?: string
  }
} | null>

/** URLのプロトコルをhttpsに変換する（不正なURLの場合はundefinedを返す） */
const toHttps = (url: string): string | undefined => {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol === 'http:') parsedUrl.protocol = 'https:'
    return parsedUrl.href
  } catch {
    return undefined
  }
}

/**
 * ISBNを使ってサーバーサイドでサムネイルURLを取得する
 * Google Books APIでURLが取得できなかった場合のみOpenBDにフォールバックする
 * （Googleで取得したURLの画像ダウンロードに失敗しても、OpenBDには進まない）
 */
const fetchThumbnailUrl = async (isbn: string): Promise<string | undefined> => {
  try {
    const googleRes = await fetch(`${GOOGLE_BOOK_SEARCH_QUERY}${isbn}`)
    if (googleRes.ok) {
      const googleData: GoogleBooksResponse = await googleRes.json()
      const thumbnail = googleData?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail
      // Google Books APIはhttpのURLを返すため、HTTPS強制の検証を通るようにhttpsへ変換する
      if (thumbnail) return toHttps(thumbnail)
    }
  } catch {
    // フォールバックに進む
  }

  try {
    const openbdRes = await fetch(`${OPENBD_SEARCH_QUERY}${isbn}`)
    if (!openbdRes.ok) return undefined
    const openbdData: OpenBDResponse = await openbdRes.json()
    // TODO: OpenBDのカバー画像（cover.openbd.jp）はnext.config.mjsのremotePatternsに含まれていないため、
    // 許可ホストに追加されるまではdownloadAndPutImageのURL検証で拒否され、画像は保存されない
    return openbdData?.[0]?.summary?.cover ?? undefined
  } catch {
    return undefined
  }
}

/**
 * 書籍登録をするServer Action
 * @param {string} title
 * @param description
 * @param {string} isbn
 * @param {number} locationId
 * @param {number} userId
 * @returns {Promise<void>}
 */
export const registerBook = async (
  title: string,
  description: string,
  isbn: string,
  locationId: number,
  userId: number,
): Promise<void> => {
  // ユーザー提供URLを使わず、ISBNからサーバーサイドでサムネイルURLを取得（SSRF対策）
  const imageUrl = await fetchThumbnailUrl(isbn)
  const vercelBlobUrl = await downloadAndPutImage(imageUrl, isbn)

  const book = await prisma.book
    .create({
      data: {
        title,
        description,
        isbn,
        imageUrl: vercelBlobUrl,
      },
    })
    .catch((e) => {
      console.error(e)
      throw new Error('Book creation failed')
    })

  await prisma.registrationHistory
    .create({
      data: {
        bookId: book.id,
        userId: userId,
        locationId: locationId,
      },
    })
    .catch((e) => {
      console.error(e)
      throw new Error('Registration creation failed')
    })

  // Slack通知処理の完了を待たない
  notifySlack(`「${title}」という書籍が登録されました。`)

  redirect(`/books/${book.id}`)
}

/**
 * 書籍追加をするServer Action
 * @param {number} bookId
 * @param {number} userId
 * @param {number} locationId
 * @returns {Promise<void>}
 */
export const addBook = async (
  bookId: number,
  userId: number,
  locationId: number,
): Promise<void> => {
  await prisma.registrationHistory
    .create({ data: { bookId: bookId, userId: userId, locationId: locationId } })
    .catch((e) => {
      console.error(e)
      throw new Error('Registration creation failed')
    })

  redirect(`/books/${bookId}`)
}
