import { render, screen } from '@testing-library/react'
import BookListClient from '@/app/users/[id]/bookListClient'
import { bookWithImage, bookWithoutImage } from '../../../../test/__utils__/data/book'

describe('BookListClient component', () => {
  const expectedBooks = [bookWithImage, bookWithoutImage]

  it('本の一覧が表示される', () => {
    render(<BookListClient books={expectedBooks} />)

    expect(screen.getByText(bookWithImage.title)).toBeInTheDocument()
    expect(screen.getByText(bookWithoutImage.title)).toBeInTheDocument()
  })

  it('本がない場合は「該当の書籍はありません」というメッセージが表示される', () => {
    render(<BookListClient books={[]} />)

    expect(screen.getByText('該当の書籍はありません')).toBeInTheDocument()
  })
})
