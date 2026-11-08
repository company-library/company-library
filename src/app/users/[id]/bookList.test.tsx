import { act, render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import BookList from '@/app/users/[id]/bookList'
import { bookWithImage, bookWithoutImage } from '../../../../test/__utils__/data/book'
import { prismaMock } from '../../../../test/__utils__/libs/prisma/singleton'

describe('BookList component', () => {
  const expectedBooks = [bookWithImage, bookWithoutImage]
  const expectedBookIds = expectedBooks.map((b) => b.id)

  it('本の一覧が表示される', async () => {
    prismaMock.book.findMany.mockResolvedValue(expectedBooks)

    await act(async () => {
      render(
        <Suspense>
          <BookList bookIds={expectedBookIds} />
        </Suspense>,
      )
    })

    expect(screen.getByText(bookWithImage.title)).toBeInTheDocument()
    expect(screen.getByText(bookWithoutImage.title)).toBeInTheDocument()
  })

  it('本がない場合は「該当の書籍はありません」というメッセージが表示される', async () => {
    prismaMock.book.findMany.mockResolvedValue([])

    await act(async () => {
      render(
        <Suspense>
          <BookList bookIds={[]} />
        </Suspense>,
      )
    })

    expect(screen.getByText('該当の書籍はありません')).toBeInTheDocument()
  })
})
