import Image from 'next/image'
import type { FC } from 'react'
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
        lendingHistories: {
          where: { returnHistory: null },
          select: {
            id: true,
            userId: true,
          },
        },
        registrationHistories: {
          select: {
            locationId: true,
            location: {
              select: {
                id: true,
                name: true,
              },
            },
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

  // 保管場所毎の在庫数を集計
  const locationStats = new Map<
    number,
    { name: string; totalCount: number; lendableCount: number }
  >()

  // 登録履歴から保管場所毎の総数を集計
  for (const regHistory of bookDetail.registrationHistories) {
    if (!regHistory.locationId || !regHistory.location) continue

    const locationId = regHistory.locationId
    const locationName = regHistory.location.name

    if (locationStats.has(locationId)) {
      const existing = locationStats.get(locationId)
      if (existing) {
        existing.totalCount += 1
      }
    } else {
      locationStats.set(locationId, {
        name: locationName,
        totalCount: 1,
        lendableCount: 1,
      })
    }
  }

  // 貸出中の数を保管場所毎から引く（簡易的に全貸出を均等に分散と仮定）
  const totalLendingCount = bookDetail.lendingHistories.length
  const totalRegistrationCount = bookDetail.registrationHistories.length

  Array.from(locationStats.values()).forEach((stats) => {
    const locationRatio = stats.totalCount / totalRegistrationCount
    const locationLendingCount = Math.round(totalLendingCount * locationRatio)
    stats.lendableCount = Math.max(0, stats.totalCount - locationLendingCount)
  })

  const reservationCount = bookDetail._count.reservations
  const totalLendableCount = Array.from(locationStats.values()).reduce(
    (sum, stats) => sum + stats.lendableCount,
    0,
  )

  // 借りているか = 返却履歴のない自分の貸出履歴がある
  const lendingHistory = bookDetail.lendingHistories.find((h) => h.userId === userId)
  const isLending = !!lendingHistory

  const isLendable = !isLending && totalLendableCount > 0

  return (
    <div className="flex flex-wrap">
      <div className="w-full lg:w-1/2">
        <Image
          src={bookDetail.imageUrl ? bookDetail.imageUrl : '/no_image.jpg'}
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
          <div className="mb-4 p-3 border-2 border-blue-200 rounded-md bg-blue-50">
            <p className="font-medium text-blue-800">全体</p>
            <p className="text-sm text-blue-700">
              <span>{`${totalLendableCount}冊貸し出し可能`}</span>
              <span className="ml-2">{`(総所蔵数: ${totalRegistrationCount}冊`}</span>
              <span className="ml-1">{`, 予約数: ${reservationCount}件)`}</span>
            </p>
          </div>

          {Array.from(locationStats.entries()).length > 0 && (
            <>
              <h3 className="text-lg font-medium mb-2">保管場所別在庫状況</h3>
              {Array.from(locationStats.entries()).map(([locationId, stats]) => (
                <div key={locationId} className="mb-2 p-3 border rounded-md bg-gray-50">
                  <p className="font-medium">{stats.name}</p>
                  <p className="text-sm text-gray-600">
                    <span>{`${stats.lendableCount}冊貸し出し可能`}</span>
                    <span className="ml-2">{`(所蔵数: ${stats.totalCount}冊)`}</span>
                  </p>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="mt-auto">
          <LendButton 
            bookId={bookId} 
            userId={userId} 
            disabled={!isLendable} 
            locationStats={locationStats}
          />
          <span className="ml-5" />
          <ReturnButton
            bookId={bookId}
            userId={userId}
            lendingHistoryId={lendingHistory ? lendingHistory.id : 0}
            disabled={!isLending}
          />
        </div>
      </div>
    </div>
  )
}

export default BookDetail
