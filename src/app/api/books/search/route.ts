import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/libs/prisma/client'
import type { CustomError } from '@/models/errors'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const q = searchParams.get('q') ?? ''
  const locationId = searchParams.get('locationId') ?? ''

  const books = await prisma.book
    .findMany({
      where: {
        // キーワード検索
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],

        // 保管場所
        registrationHistories: {
          some: {
            location: {
              id: locationId ? Number(locationId) : undefined,
            },
          },
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
