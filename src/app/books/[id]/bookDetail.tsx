import { FC } from 'react'
import Image from 'next/image'
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
        lendingHistories: { where: { returnHistory: null } },
        _count: {
          select: {
            registrationHistories: true,
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

  const holdingCount = bookDetail._count.registrationHistories
  const reservationCount = bookDetail._count.reservations
  const lendableCount = holdingCount - bookDetail.lendingHistories.length

  // 借りているか = 返却履歴のない自分の貸出履歴がある
  const lendingHistory = bookDetail.lendingHistories.find((h) => h.userId === userId)
  const isLending = !!lendingHistory

  const isLendable = !isLending && lendableCount > 0

  return (
    <div className="flex flex-wrap">
      <div className="w-full lg:w-1/2">
        <Image
          src={bookDetail.imageUrl ? bookDetail.imageUrl : '/no_image.jpg'}
          alt={bookDetail.title}
          width={300}
          height={400}
        />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col">
        <h1 className="text-3xl font-bold">{bookDetail.title}</h1>
        <p className="mt-5 indent-3">
          <span>{`${lendableCount}冊貸し出し可能`}</span> (
          <span>{`所蔵数: ${holdingCount}冊`}</span>, <span>{`予約数: ${reservationCount}件`}</span>
          )
        </p>

        <div className="mt-auto">
          <LendButton bookId={bookId} userId={userId} disabled={!isLendable} />
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
