'use server'

import { redirect } from 'next/navigation'
import prisma from '@/libs/prisma/client'
import { notifySlack } from '@/libs/slack/webhook'
import { downloadAndPutImage } from '@/libs/vercel/downloadAndPutImage'

/**
 * 書籍登録をするServer Action
 * @param {string} title
 * @param {string} isbn
 * @param {string | undefined} imageUrl
 * @param {number} userId
 * @returns {Promise<void>}
 */
export const registerBook = async (
  title: string,
  isbn: string,
  imageUrl: string | undefined,
  userId: number,
): Promise<void> => {
  const vercelBlobUrl = await downloadAndPutImage(imageUrl, isbn)

  const book = await prisma.book
    .create({
      data: {
        title,
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
 * @returns {Promise<void>}
 */
export const addBook = async (bookId: number, userId: number): Promise<void> => {
  await prisma.registrationHistory
    .create({ data: { bookId: bookId, userId: userId } })
    .catch((e) => {
      console.error(e)
      throw new Error('Registration creation failed')
    })

  redirect(`/books/${bookId}`)
}
