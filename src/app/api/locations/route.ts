import { NextResponse } from 'next/server'
import prisma from '@/libs/prisma/client'
import type { CustomError } from '@/models/errors'

export async function GET() {
  const locations = await prisma.location
    .findMany({
      orderBy: {
        order: 'asc',
      },
    })
    .catch((e) => {
      console.error(e)
      return new Error('Location fetch failed')
    })

  if (locations instanceof Error) {
    const customError: CustomError = { errorCode: '500', message: locations.message }
    return NextResponse.json(customError, { status: 500 })
  }

  return NextResponse.json({ locations })
}
