import prisma from '@/libs/prisma/client'
import type { CustomError } from '@/models/errors'
import { NextResponse } from 'next/server'

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

  return NextResponse.json({ book: book })
}
