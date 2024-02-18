import { render, screen } from '@testing-library/react'
import { user1 } from '../../../__utils__/data/user'

const getServerSessionMock = jest.fn().mockReturnValue({ customUser: { id: user1.id } })
jest.mock('next-auth', () => ({
  __esModule: true,
  getServerSession: () => getServerSessionMock(),
}))

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  __esModule: true,
  authOptions: {},
}))

jest.mock('@/app/books/register/bookForm', () => ({
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
