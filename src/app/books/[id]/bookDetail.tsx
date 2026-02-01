import type { FC } from 'react'
import BookDetailClient from '@/app/books/[id]/bookDetailClient'
import prisma from '@/libs/prisma/client'

type BookDetailProps = {
  bookId: number
  userId: number
}

const BookDetail: FC<BookDetailProps> = async ({ bookId, userId }) => {
  const bookDetail = await prisma.book
    .findUnique({
      where: { id: bookId },
      select: {
        title: true,
        imageUrl: true,
        registrationHistories: {
          select: {
            locationId: true,
            location: {
              select: {
                name: true,
                order: true,
              },
            },
          },
        },
        lendingHistories: {
          where: { returnHistory: null },
          select: {
            id: true,
            userId: true,
            locationId: true,
          },
        },
        _count: {
          select: {
            reservations: true,
          },
        },
      },
    })
    .catch((e) => {
      console.error(e)
      return new Error('Book fetch failed')
    })
  if (bookDetail instanceof Error) {
    return <div>本の取得に失敗しました。再読み込みしてみてください。</div>
  }

  if (bookDetail == null) {
    console.error('対象のIDの本は存在しません。bookId:', bookId)
    return <div>本の取得に失敗しました。再読み込みしてみてください。</div>
  }

  // 保管場所毎の在庫数
  const locationCountsMap = bookDetail.registrationHistories.reduce((acc, regHistory) => {
    if (!regHistory.locationId || !regHistory.location) {
      return acc
    }

    const locationId = regHistory.locationId
    const locationName = regHistory.location.name
    const locationOrder = regHistory.location.order
    const existing = acc.get(locationId)

    return new Map(acc).set(locationId, {
      name: locationName,
      order: locationOrder,
      totalCount: (existing?.totalCount ?? 0) + 1,
    })
  }, new Map<number, { name: string; order: number; totalCount: number }>())

  // 保管場所毎の貸出数
  const locationLendingCountsMap = bookDetail.lendingHistories.reduce((acc, lendingHistory) => {
    if (!lendingHistory.locationId) {
      return acc
    }

    const locationId = lendingHistory.locationId
    const existing = acc.get(locationId)

    return new Map(acc).set(locationId, (existing ?? 0) + 1)
  }, new Map<number, number>())

  // 貸出可能数
  const locationStats = new Map(
    Array.from(locationCountsMap.entries()).map(([locationId, location]) => {
      const lendingCount = locationLendingCountsMap.get(locationId) ?? 0
      const lendableCount = location.totalCount - lendingCount

      return [
        locationId,
        {
          ...location,
          lendableCount,
        },
      ]
    }),
  )

  const totalLendableCount = Array.from(locationStats.values()).reduce(
    (sum, stats) => sum + stats.lendableCount,
    0,
  )

  const lendingHistory = bookDetail.lendingHistories.find((h) => h.userId === userId)
  const isLending = !!lendingHistory
  const returnLocationId = lendingHistory?.locationId
  const returnLocation = returnLocationId ? locationStats.get(returnLocationId)?.name : undefined

  const isLendable = !isLending && totalLendableCount > 0

  return (
    <BookDetailClient
      bookId={bookId}
      userId={userId}
      title={bookDetail.title}
      imageUrl={bookDetail.imageUrl}
      locationStats={locationStats}
      isLendable={isLendable}
      isLending={isLending}
      lendingHistoryId={lendingHistory ? lendingHistory.id : 0}
      returnLocation={returnLocation}
    />
  )
}

export default BookDetail
