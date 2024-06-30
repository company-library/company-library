import { toJstFormat } from '@/libs/luxon/utils'
import { render, screen } from '@testing-library/react'
import { DateTime, Settings } from 'luxon'
import { bookWithImage, bookWithoutImage } from '../../../__utils__/data/book'
import { lendingHistory1, lendingHistory2 } from '../../../__utils__/data/lendingHistory'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'

describe('ReadingBookList component', () => {
  const expectedBooks = [bookWithImage, bookWithoutImage]
  const expectedReadingBooks = [lendingHistory1, lendingHistory2]

  const ReadingBookList = require('@/app/users/[id]/readingBookList').default

  it('返却期限と本の一覧が表示される', async () => {
    prismaMock.book.findMany.mockResolvedValue(expectedBooks)

    render(await ReadingBookList({ readingBooks: expectedReadingBooks }))

    expect(screen.getByText(bookWithImage.title)).toBeInTheDocument()
    expect(screen.getByText(toJstFormat(lendingHistory1.dueDate))).toBeInTheDocument()
    expect(screen.getByText(bookWithoutImage.title)).toBeInTheDocument()
    expect(screen.getByText(toJstFormat(lendingHistory2.dueDate))).toBeInTheDocument()
  })

  it('本がない場合は「該当の書籍はありません」というメッセージが表示される', async () => {
    prismaMock.book.findMany.mockResolvedValue([])

    render(await ReadingBookList({ readingBooks: [] }))

    expect(screen.getByText('該当の書籍はありません')).toBeInTheDocument()
  })

  it('期限が過ぎている場合、返却期限は赤太字で表示される', async () => {
    prismaMock.book.findMany.mockResolvedValue(expectedBooks)
    const expectedNow = DateTime.fromISO('2020-02-02T10:00+09:00')
    Settings.now = () => expectedNow.toMillis()

    render(await ReadingBookList({ readingBooks: expectedReadingBooks }))

    expect(screen.getByText(toJstFormat(lendingHistory1.dueDate))).toBeInTheDocument()
    expect(screen.getByText(toJstFormat(lendingHistory1.dueDate))).toHaveAttribute(
      'data-overdue',
      'true',
    )
    expect(screen.getByText(toJstFormat(lendingHistory1.dueDate))).toHaveClass(
      'data-[overdue=true]:text-red-400',
      'data-[overdue=true]:font-bold',
    )
    expect(screen.getByText(toJstFormat(lendingHistory2.dueDate))).toHaveAttribute(
      'data-overdue',
      'false',
    )
    expect(screen.getByText(toJstFormat(lendingHistory2.dueDate))).toHaveClass(
      'data-[overdue=true]:text-red-400',
      'data-[overdue=true]:font-bold',
    )
  })
})
