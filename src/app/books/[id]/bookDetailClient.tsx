'use client'

import Image from 'next/image'
import type { FC } from 'react'
import AddImpressionButton from '@/app/books/[id]/addImpressionButton'
import LendButton from '@/app/books/[id]/lendButton'
import ReturnButton from '@/app/books/[id]/returnButton'

type LocationStats = Map<
  number,
  {
    name: string
    order: number
    totalCount: number
    lendableCount: number
  }
>

type BookDetailClientProps = {
  bookId: number
  userId: number
  title: string
  imageUrl: string | null
  locationStats: LocationStats
  isLendable: boolean
  isLending: boolean
  lendingHistoryId: number
  returnLocation: string | undefined
}

const BookDetailClient: FC<BookDetailClientProps> = ({
  bookId,
  userId,
  title,
  imageUrl,
  locationStats,
  isLendable,
  isLending,
  lendingHistoryId,
  returnLocation,
}) => {
  return (
    <div className="flex flex-wrap">
      <div className="w-full lg:w-1/2">
        <Image
          src={imageUrl ? imageUrl : '/no_image.jpg'}
          alt={title}
          width={300}
          height={400}
          className="w-[300px] h-[400px]"
          priority={true}
        />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col">
        <h1 className="text-3xl font-bold">{title}</h1>

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
            lendingHistoryId={lendingHistoryId}
            disabled={!isLending}
            locationName={returnLocation}
          />

          <AddImpressionButton bookId={bookId} />
        </div>
      </div>
    </div>
  )
}

export default BookDetailClient
