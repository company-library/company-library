'use server'

import prisma from '@/libs/prisma/client'
import { redirect } from 'next/navigation'

export const registerBook = async (
  title: string,
  isbn: string,
  imageUrl: string | undefined,
  userId: number,
) => {
  const book = await prisma.book
    .create({
      data: {
        title,
        isbn,
        imageUrl,
      },
    })
    .catch((e) => {
      console.error(e)
      return new Error('Book creation failed')
    })
  if (book instanceof Error) {
    return book
  }

  const registrationHistory = await prisma.registrationHistory
    .create({
      data: {
        bookId: book.id,
        userId: userId,
      },
    })
    .catch((e) => {
      console.error(e)
      return new Error('Registration creation failed')
    })
  if (registrationHistory instanceof Error) {
    return registrationHistory
  }

  redirect(`/books/${book.id}`)
}

export const addBook = async (bookId: number, userId: number) => {
  const history = await prisma.registrationHistory
    .create({ data: { bookId: bookId, userId: userId } })
    .catch((e) => {
      console.error(e)
      return new Error('Registration creation failed')
    })
  if (history instanceof Error) {
    return history
  }

  redirect(`/books/${bookId}`)
}
