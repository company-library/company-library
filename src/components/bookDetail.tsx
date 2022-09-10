import { FC } from 'react'
import Image from 'next/image'
import LendButton from '@/components/lendButton'

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
  const holdings = book.registrationHistories.length
  const reservations = book.reservations.length
  const lendHistories = book.lendingHistories.length
  // 貸し出し可能数 = 所蔵数 - 貸し出し数 - 予約数
  const lendables = holdings - lendHistories - reservations

  // 借りているか = 返却履歴のない貸出履歴がある
  const isLending = book.lendingHistories.some(
    (h) => h.user.id === 1 && h.returnHistories.length === 0,
  )

  // 借りていない かつ 貸し出し可能なら、有効化
  const isLendable = !isLending && lendables > 0

  return (
    <div>
      <div>
        <Image
          src={book.imageUrl ? book.imageUrl : '/no_image.jpg'}
          alt={book.title}
          width={128}
          height={200}
        />
      </div>

      <div>{book.title}</div>
      <div>{`${lendables}冊貸し出し可能 (所蔵数: ${holdings}冊, 予約数: ${reservations}冊)`}</div>

      <LendButton bookId={book.id} disabled={!isLendable} />
      <button
        className="bg-gray-400 hover:bg-gray-300 text-white rounded px-4 py-2 disabled:bg-gray-900"
        disabled={false}
      >
        返却する
      </button>
      <div>借りた人</div>

      <table>
        <thead>
          <tr>
            <th>返却予定日 or 返却日付</th>
            <th>人</th>
            <th>感想</th>
          </tr>
        </thead>
        <tbody>
          {book.lendingHistories.map((lendingHistory) => {
            return (
              <tr key={lendingHistory.id}>
                <td>{lendingHistory.returnHistories[0]?.createdAt || lendingHistory.dueDate}</td>
                <td>{lendingHistory.user.name}</td>
                <td>{lendingHistory.user.impressions[0]?.impression}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default BookDetail
