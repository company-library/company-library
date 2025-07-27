import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/libs/prisma/client'
import type { CustomError } from '@/models/errors'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''

  const books = await prisma.book
    .findMany({
      where: {
        title: {
          contains: q,
          mode: 'insensitive',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    .catch((e) => {
      console.error(e)
      return new Error('Book fetch failed')
    })

  if (books instanceof Error) {
    const customError: CustomError = { errorCode: '500', message: books.message }
    return NextResponse.json(customError, { status: 500 })
  }

  return NextResponse.json({ books })
}
