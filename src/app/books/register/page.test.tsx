import { render, screen } from '@testing-library/react'
import RegisterPageClient from '@/app/books/register/registerPageClient'
import { user1 } from '../../../../test/__utils__/data/user'

vi.mock('@/app/books/register/bookForm', () => ({
  default: () => <div>登録フォーム</div>,
}))

describe('RegisterPageClient component', () => {
  it('書籍登録ページが表示される', () => {
    render(<RegisterPageClient userId={user1.id} />)

    expect(screen.getByText('本を登録')).toBeInTheDocument()
    expect(screen.getByText('登録フォーム')).toBeInTheDocument()
  })
})
