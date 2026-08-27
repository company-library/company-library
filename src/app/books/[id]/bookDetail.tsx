import Image from 'next/image'
import type { FC } from 'react'
import AddImpressionButton from '@/app/books/[id]/addImpressionButton'
import LendButton from '@/app/books/[id]/lendButton'
import ReturnButton from '@/app/books/[id]/returnButton'
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
    <div className="flex flex-wrap">
      <div className="w-full lg:w-1/2">
        <Image
          src={bookDetail.imageUrl || '/no_image.jpg'}
          alt={bookDetail.title}
          width={300}
          height={400}
          className="w-[300px] h-[400px]"
          priority={true}
        />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col">
        <h1 className="text-3xl font-bold">{bookDetail.title}</h1>

        <div className="mt-3">
          {Array.from(locationStats.entries())
            .sort((a, b) => a[1].order - b[1].order)
            .map(([locationId, stats]) => {
              const isLocationLendable = !isLending && stats.lendableCount > 0
              return (
                <div
                  key={locationId}
                  className={`mb-2 p-3 border-2 rounded-md ${isLocationLendable ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <p
                    className={`font-medium ${isLocationLendable ? 'text-green-800' : 'text-gray-800'}`}
                  >
                    {stats.name}
                  </p>
                  <p
                    className={`text-sm ${isLocationLendable ? 'text-green-700' : 'text-gray-600'}`}
                  >
                    <span>{`${stats.lendableCount}冊貸し出し可能`}</span>
                    <span className="ml-2">{`(所蔵数: ${stats.totalCount}冊)`}</span>
                  </p>
                </div>
              )
            })}
        </div>

        <div className="mt-auto flex gap-5">
          <LendButton
            bookId={bookId}
            userId={userId}
            disabled={!isLendable}
            locationStats={locationStats}
          />
          <ReturnButton
            bookId={bookId}
            userId={userId}
            lendingHistoryId={lendingHistory ? lendingHistory.id : 0}
            disabled={!isLending}
            locationName={returnLocation}
          />

          <AddImpressionButton bookId={bookId} />
        </div>
      </div>
    </div>
  )
}

export default BookDetail
