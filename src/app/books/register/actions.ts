'use server'

import prisma from '@/libs/prisma/client'
import { CustomError } from '@/models/errors'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export const registerBook = async (title: string, isbn: string, imageUrl: string) => {
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
    const customError: CustomError = { errorCode: '500', message: book.message }
    return NextResponse.json(customError, { status: 500 })
  }
  redirect(`/books/${book.id}`)

  // if (title) {
  //   insertBook({ title, isbn, imageUrl }).then((bookResult) => {
  //     if (bookResult.error) {
  //       console.error('book insert error: ', bookResult.error)
  //       return
  //     }
  //
  //     const bookId = bookResult.data?.insert_books_one?.id
  //     if (bookId) {
  //       insertRegistrationHistory({ bookId: bookId, userId: 1 }).then((registrationResult) => {
  //         if (registrationResult.error) {
  //           console.error('registration insert error: ', registrationResult.error)
  //           return
  //         }
  //         router.push(`/books/${bookId}`)
  //       })
  //     }
  //   })
  // }
}

export const addBook = async (bookId: number) => {
  insertRegistrationHistory({ bookId: bookId, userId: 1 }).then((registrationResult) => {
    if (registrationResult.error) {
      console.error('registration insert error: ', registrationResult.error)
      return
    }
    router.push(`/books/${bookId}`)
  })
}
