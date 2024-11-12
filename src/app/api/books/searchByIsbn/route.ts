import prisma from '@/libs/prisma/client'
import type { CustomError } from '@/models/errors'
import { NextResponse } from 'next/server'
import { OPENBD_SEARCH_QUERY } from '@/constants'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const isbn = searchParams.get('isbn') ?? ''

  const book = await prisma.book
    .findUnique({
      where: { isbn },
      include: {
        _count: {
          select: { registrationHistories: true },
        },
      },
    })
    .catch((e) => {
      console.error(e)
      return new Error('Book fetch failed')
    })

  if (book instanceof Error) {
    const customError: CustomError = { errorCode: '500', message: book.message }
    return NextResponse.json(customError, { status: 500 })
  }

  if (!book) {
    const openBdResponse = await fetch(`${OPENBD_SEARCH_QUERY}${isbn}`)
    const openBdData = await openBdResponse.json()

    if (openBdData.length === 0) {
      const customError: CustomError = { errorCode: '404', message: 'Book not found' }
      return NextResponse.json(customError, { status: 404 })
    }

    const openBdBook = {
      title: openBdData[0].summary.title,
      isbn: isbn,
      imageUrl: openBdData[0].summary.cover,
    }

    return NextResponse.json({ book: openBdBook })
  }

  return NextResponse.json({ book: book })
}
