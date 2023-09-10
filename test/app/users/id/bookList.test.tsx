import { render } from '@testing-library/react'
import { bookWithImage, bookWithoutImage } from '../../../__utils__/data/book'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'

describe('BookList component', () => {
  const expectedBooks = [bookWithImage, bookWithoutImage]
  const expectedBookIds = expectedBooks.map((b) => b.id)

  const BookList = require('@/app/users/[id]/bookList').default

  it('本の一覧が表示される', async () => {
    prismaMock.book.findMany.mockResolvedValue(expectedBooks)

    const { getByText } = render(await BookList({ bookIds: expectedBookIds }))

    expect(getByText(bookWithImage.title)).toBeInTheDocument()
    expect(getByText(bookWithoutImage.title)).toBeInTheDocument()
  })

  it('本がない場合は「該当の書籍はありません」というメッセージが表示される', async () => {
    prismaMock.book.findMany.mockResolvedValue([])

    const { getByText } = render(await BookList({ bookIds: [] }))

    expect(getByText('該当の書籍はありません')).toBeInTheDocument()
  })
})
