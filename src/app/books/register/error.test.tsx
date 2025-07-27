import { render, screen } from '@testing-library/react'
import ErrorPage from '@/app/books/register/error'

describe('register error page', async () => {
  it('書籍登録のエラーページが表示される', () => {
    render(<ErrorPage />)

    expect(
      screen.getByRole('heading', { level: 2, name: '書籍の登録に失敗しました' }),
    ).toBeInTheDocument()
    expect(screen.getByText('管理者に問い合わせてください')).toBeInTheDocument()
  })
})
