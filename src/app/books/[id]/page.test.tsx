import { render, screen } from '@testing-library/react'
import BookDetailPageClient from '@/app/books/[id]/bookDetailPageClient'

describe('BookDetailPageClient component', () => {
  it('本の詳細情報が表示される', () => {
    render(
      <BookDetailPageClient
        bookDetailSection={<div>BookDetail</div>}
        lendingListSection={<div>LendingList</div>}
        impressionListSection={<div>ImpressionList</div>}
        returnListSection={<div>ReturnList</div>}
      />,
    )

    const heading2s = screen.getAllByRole('heading', { level: 2 })
    expect(heading2s.length).toBe(3)
    expect(heading2s[0].textContent).toBe('借りているユーザー')
    expect(heading2s[1].textContent).toBe('感想')
    expect(heading2s[2].textContent).toBe('借りたユーザー')
    expect(screen.getByText('BookDetail')).toBeInTheDocument()
    expect(screen.getByText('LendingList')).toBeInTheDocument()
    expect(screen.getByText('ImpressionList')).toBeInTheDocument()
    expect(screen.getByText('ReturnList')).toBeInTheDocument()
  })
})
