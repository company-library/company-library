'use server'

import prisma from '@/libs/prisma/client'
import { redirect } from 'next/navigation'

/**
 * 書籍を貸し出すServer Action
 * @param {number} bookId
 * @param {number} userId
 * @param {Date} dueDate
 * @returns {Promise<Error>}
 */
export const lendBook = async (bookId: number, userId: number, dueDate: Date): Promise<Error> => {
  const history = await prisma.lendingHistory
    .create({ data: { bookId, userId, dueDate } })
    .catch((e) => {
      console.error(e)
      return new Error('貸し出しに失敗しました。もう一度試して見てください。')
    })
  if (history instanceof Error) {
    return history
  }

  redirect(`${process.env.NEXTAUTH_URL}/books/${bookId}`)
}
