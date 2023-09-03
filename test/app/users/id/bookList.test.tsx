import { render } from '@testing-library/react'
import { bookWithImage, bookWithoutImage } from '../../../__utils__/data/book'
import BookList from '@/app/users/[id]/bookList'

describe('BookList component', () => {
  const books = [bookWithImage, bookWithoutImage]

  it('本の一覧が表示される', () => {
    const { getByText } = render(<BookList books={books} />)

    expect(getByText(bookWithImage.title)).toBeInTheDocument()
    expect(getByText(bookWithoutImage.title)).toBeInTheDocument()
  })

  it('本がない場合は「該当の書籍はありません」というメッセージが表示される', () => {
    const { getByText } = render(<BookList books={[]} />)

    expect(getByText('該当の書籍はありません')).toBeInTheDocument()
  })
})
