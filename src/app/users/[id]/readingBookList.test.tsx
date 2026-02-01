import { render, screen } from '@testing-library/react'
import { DateTime, Settings } from 'luxon'
import { Suspense } from 'react'
import ReadingBookList from '@/app/users/[id]/readingBookList'
import { toJstFormat } from '@/libs/luxon/utils'
import { bookWithImage, bookWithoutImage } from '../../../../test/__utils__/data/book'
import { lendingHistory1, lendingHistory2 } from '../../../../test/__utils__/data/lendingHistory'
import { prismaMock } from '../../../../test/__utils__/libs/prisma/singleton'

describe.skip('ReadingBookList component', async () => {
  const expectedBooks = [bookWithImage, bookWithoutImage]
  const expectedReadingBooks = [lendingHistory1, lendingHistory2]

  it('返却期限と本の一覧が表示される', async () => {
    prismaMock.book.findMany.mockResolvedValue(expectedBooks)

    render(
      <Suspense>
        <ReadingBookList readingBooks={expectedReadingBooks} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText(bookWithImage.title)).toBeInTheDocument()
    expect(screen.getByText(toJstFormat(lendingHistory1.dueDate))).toBeInTheDocument()
    expect(screen.getByText(bookWithoutImage.title)).toBeInTheDocument()
    expect(screen.getByText(toJstFormat(lendingHistory2.dueDate))).toBeInTheDocument()
  })

  it('本がない場合は「該当の書籍はありません」というメッセージが表示される', async () => {
    prismaMock.book.findMany.mockResolvedValue([])

    render(
      <Suspense>
        <ReadingBookList readingBooks={[]} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText('該当の書籍はありません')).toBeInTheDocument()
  })

  it('期限が過ぎている場合、返却期限は赤太字で表示される', async () => {
    prismaMock.book.findMany.mockResolvedValue(expectedBooks)
    const expectedNow = DateTime.fromISO('2020-02-02T10:00+09:00')
    Settings.now = () => expectedNow.toMillis()

    render(
      <Suspense>
        <ReadingBookList readingBooks={expectedReadingBooks} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText(toJstFormat(lendingHistory1.dueDate))).toBeInTheDocument()
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
