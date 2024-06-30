import { render } from '@testing-library/react'
import { bookWithImage, bookWithoutImage } from '../../../__utils__/data/book'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'
import { Suspense } from 'react'
import BookList from '@/app/users/[id]/bookList'

describe('BookList component', async () => {
  const expectedBooks = [bookWithImage, bookWithoutImage]
  const expectedBookIds = expectedBooks.map((b) => b.id)

  it('本の一覧が表示される', async () => {
    prismaMock.book.findMany.mockResolvedValue(expectedBooks)

    const { findByText, getByText } = render(
      <Suspense>
        <BookList bookIds={expectedBookIds} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await findByText(bookWithImage.title)).toBeInTheDocument()
    expect(getByText(bookWithoutImage.title)).toBeInTheDocument()
  })

  it('本がない場合は「該当の書籍はありません」というメッセージが表示される', async () => {
    prismaMock.book.findMany.mockResolvedValue([])

    const { findByText } = render(
      <Suspense>
        <BookList bookIds={[]} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await findByText('該当の書籍はありません')).toBeInTheDocument()
  })
})
