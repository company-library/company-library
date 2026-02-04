import { render, screen } from '@testing-library/react'
import UserPageClient from '@/app/users/[id]/userPageClient'

describe('UserPageClient component', () => {
  it('ユーザーの情報が表示される', () => {
    render(
      <UserPageClient
        userName="テスト太郎"
        readingBooksCount={3}
        haveReadBooksCount={4}
        readingBookListSection={<div>ReadingBookList</div>}
        bookListSection={<div>BookList</div>}
      />,
    )

    expect(screen.getByText('テスト太郎さんの情報')).toBeInTheDocument()
    expect(screen.getByText('現在読んでいる書籍(3冊)')).toBeInTheDocument()
    expect(screen.getByText('今まで読んだ書籍(4冊)')).toBeInTheDocument()
    expect(screen.getByText('ReadingBookList')).toBeInTheDocument()
    expect(screen.getByText('BookList')).toBeInTheDocument()
  })
})
