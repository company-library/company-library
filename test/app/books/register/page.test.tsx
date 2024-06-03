import { render, screen } from '@testing-library/react'
import { user1 } from '../../../__utils__/data/user'

const getServerSessionMock = vi.fn().mockReturnValue({ customUser: { id: user1.id } })
vi.mock('next-auth', () => ({
  __esModule: true,
  getServerSession: () => getServerSessionMock(),
}))

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  __esModule: true,
  authOptions: {},
}))

vi.mock('@/app/books/register/bookForm', () => ({
  __esModule: true,
  default: () => <div>登録フォーム</div>,
}))

describe('register page', () => {
  const RegisterPage = require('@/app/books/register/page').default

  it('書籍登録ページが表示される', async () => {
    render(await RegisterPage())

    expect(screen.getByText('本を登録')).toBeInTheDocument()
  })

  it('セッションが取得できない場合はエラーメッセージが表示される', async () => {
    getServerSessionMock.mockReturnValueOnce(null)

    render(await RegisterPage())

    expect(
      screen.getByText('セッションが取得できませんでした。再読み込みしてみてください。'),
    ).toBeInTheDocument()
  })
})
