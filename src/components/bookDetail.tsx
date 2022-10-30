import { FC } from 'react'
import Image from 'next/image'
import LendButton from '@/components/lendButton'
import ReturnButton from '@/components/returnButton'
import { useCustomUser } from '@/hooks/useCustomUser'
import { DateTime } from 'luxon'

const dateFormat = 'yyyy/MM/dd'

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
        impressions: Array<{
          impression: string
          createdAt: any
          updatedAt: any
        }>
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
      <div>
        <Image
          src={book.imageUrl ? book.imageUrl : '/no_image.jpg'}
          alt={book.title}
          width={300}
          height={400}
        />
      </div>

      <div>{book.title}</div>
      <div>
        <span>{`${lendables}冊貸し出し可能`}</span> (<span>{`所蔵数: ${holdings}冊`}</span>,{' '}
        <span>{`予約数: ${reservations}件`}</span>)
      </div>

      <LendButton bookId={book.id} disabled={!isLendable} />
      <ReturnButton
        lendingHistoryId={lendingHistory ? lendingHistory.id : 0}
        disabled={!isLending}
      />

      {lendingHistories.length > 0 && (
        <>
          <div>借りている人</div>
          <table>
            <thead>
              <tr>
                <th>返却予定日</th>
                <th>人</th>
              </tr>
            </thead>
            <tbody>
              {lendingHistories.map((lendingHistory, index) => {
                return (
                  <tr key={lendingHistory.id}>
                    <td data-testid={`dueDate-${index}`}>
                      {DateTime.fromISO(lendingHistory.dueDate)
                        .setZone('Asia/Tokyo')
                        .toFormat(dateFormat)}
                    </td>
                    <td data-testid={`lendingUser-${index}`}>{lendingHistory.user.name}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}

      <div>借りた人</div>
      {lentHistories.length === 0 ? (
        <div>いません</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>返却日付</th>
              <th>人</th>
              <th>感想</th>
            </tr>
          </thead>
          <tbody>
            {lentHistories.map((lendingHistory, index) => {
              return (
                <tr key={lendingHistory.id}>
                  <td data-testid={`returnedDate-${index}`}>
                    {DateTime.fromISO(lendingHistory.returnHistories[0].createdAt)
                      .setZone('Asia/Tokyo')
                      .toFormat(dateFormat)}
                  </td>
                  <td data-testid={`returnedUser-${index}`}>{lendingHistory.user.name}</td>
                  <td data-testid={`impression-${index}`}>
                    {lendingHistory.user.impressions[0]?.impression}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default BookDetail
