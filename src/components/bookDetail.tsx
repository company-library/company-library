import { FC } from 'react'
import Image from 'next/image'
import LendButton from '@/components/lendButton'
import ReturnButton from '@/components/returnButton'
import { useCustomUser } from '@/hooks/useCustomUser'
import { DateTime } from 'luxon'
import { DATE_FORMAT } from '@/constants'
import ImpressionList from '@/components/bookDetails/impressionList'
import UserAvatar from '@/components/userAvatar'

type BookDetailProps = {
  book: {
    id: number
    title: string
    isbn: string
    imageUrl?: string | null
    registrationHistories: Array<{
      userId: number
      createdAt: any
    }>
    lendingHistories: Array<{
      id: number
      createdAt: any
      dueDate: any
      user: {
        id: number
        name: string
        imageUrl?: string | null
      }
      returnHistories: Array<{
        createdAt: any
      }>
    }>
    reservations: Array<{
      userId: number
      reservationDate: any
      createdAt: any
    }>
  }
}

const BookDetail: FC<BookDetailProps> = ({ book }) => {
  const { user } = useCustomUser()
  const userId = user ? user.id : 0

  const holdings = book.registrationHistories.length
  const reservations = book.reservations.length
  const lendHistories = book.lendingHistories.filter((h) => h.returnHistories.length === 0)

  const lendables = holdings - lendHistories.length - reservations

  // 借りているか = 返却履歴のない自分の貸出履歴がある
  const lendingHistory = lendHistories.find((h) => h.user.id === userId)
  const isLending = !!lendingHistory

  const isLendable = !isLending && lendables > 0

  const lendingHistories = book.lendingHistories
    .filter((h) => h.returnHistories.length === 0)
    .sort((h1, h2) => (h1.dueDate > h2.dueDate ? 1 : -1))

  const lentHistories = book.lendingHistories
    .filter((h) => h.returnHistories.length !== 0)
    .sort((h1, h2) => (h1.returnHistories[0].createdAt < h2.returnHistories[0].createdAt ? 1 : -1))

  return (
    <div>
      <div className="flex flex-wrap">
        <div className="w-full lg:w-1/2">
          <Image
            src={book.imageUrl ? book.imageUrl : '/no_image.jpg'}
            alt={book.title}
            width={300}
            height={400}
          />
        </div>

        <div className="w-full lg:w-1/2 flex flex-col">
          <h1 className="text-3xl font-bold">{book.title}</h1>

          <p className="mt-5 indent-3">
            <span>{`${lendables}冊貸し出し可能`}</span> (<span>{`所蔵数: ${holdings}冊`}</span>,{' '}
            <span>{`予約数: ${reservations}件`}</span>)
          </p>

          <div className="mt-auto">
            <LendButton bookId={book.id} disabled={!isLendable} />
            <span className="ml-5">
              <ReturnButton
                lendingHistoryId={lendingHistory ? lendingHistory.id : 0}
                disabled={!isLending}
              />
            </span>
          </div>
        </div>
      </div>

      <div className="mt-10">
        {lendingHistories.length > 0 && (
          <div className="mt-2">
            借りている人
            <table className="table w-full">
              <tbody>
                {lendingHistories.map((lendingHistory, index) => {
                  const dueDate = DateTime.fromISO(lendingHistory.dueDate)
                  const isOver = dueDate.diff(DateTime.now(), 'days').days <= -1

                  return (
                    <tr className="hover:hover" key={lendingHistory.id}>
                      <td className="w-[15rem]">
                        <span
                          className={isOver ? 'text-red-400 font-bold' : ''}
                          data-testid={`dueDate-${index}`}
                        >
                          {dueDate.setZone('Asia/Tokyo').toFormat(DATE_FORMAT)}
                        </span>
                      </td>
                      <td data-testid={`lendingUser-${index}`}>
                        <UserAvatar user={lendingHistory.user} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-2">
          感想
          <ImpressionList bookId={book.id} />
        </div>

        <div className="mt-2">
          借りた人
          {lentHistories.length === 0 ? (
            <p>いません</p>
          ) : (
            <table className="table w-full">
              <tbody>
                {lentHistories.map((lentHistory, index) => {
                  return (
                    <tr className="hover:hover" key={lentHistory.id}>
                      <td className="w-[15rem]" data-testid={`returnedDate-${index}`}>
                        {DateTime.fromISO(lentHistory.createdAt)
                          .setZone('Asia/Tokyo')
                          .toFormat(DATE_FORMAT)}
                        〜
                        {DateTime.fromISO(lentHistory.returnHistories[0].createdAt)
                          .setZone('Asia/Tokyo')
                          .toFormat(DATE_FORMAT)}
                      </td>
                      <td data-testid={`returnedUser-${index}`}>
                        <UserAvatar user={lentHistory.user} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookDetail
