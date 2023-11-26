import { render } from '@testing-library/react'
import { user1 } from '../__utils__/data/user'

const pathnameMock = jest.fn().mockReturnValue({ push: jest.fn() })
jest.mock('next/navigation', () => ({
  __esModule: true,
  usePathname: () => pathnameMock(),
}))

const loggedInUser = user1
const getServerSessionMock = jest.fn().mockReturnValue({ customUser: { id: loggedInUser.id } })
jest.mock('next-auth', () => ({
  __esModule: true,
  getServerSession: () => getServerSessionMock(),
}))

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  __esModule: true,
  authOptions: {},
}))

describe('navigationBar component', () => {
  const NavigationBar = require('@/app/navigationBar').default

  it('ナビゲーション項目が表示される', async () => {
    const { getByText } = render(await NavigationBar())

    expect(getByText('company-library')).toBeInTheDocument()
    expect(getByText('書籍一覧')).toBeInTheDocument()
    expect(getByText('書籍一覧')).not.toHaveClass('bg-gray-600')
    expect(getByText('登録')).toBeInTheDocument()
    expect(getByText('登録')).not.toHaveClass('bg-gray-600')
    expect(getByText('マイページ')).toBeInTheDocument()
    expect(getByText('マイページ')).not.toHaveClass('bg-gray-600')
    expect(getByText('利用者一覧')).toBeInTheDocument()
    expect(getByText('利用者一覧')).not.toHaveClass('bg-gray-600')
  })

  it('pathが/の場合、書籍一覧ボタンのデザインが強調される', async () => {
    pathnameMock.mockReturnValue('/')

    const { getByText } = render(await NavigationBar())

    expect(getByText('書籍一覧')).toHaveClass('bg-gray-600')
  })

  it('pathが/books/registerの場合、登録ボタンのデザインが強調される', async () => {
    pathnameMock.mockReturnValue('/books/register')

    const { getByText } = render(await NavigationBar())

    expect(getByText('登録')).toHaveClass('bg-gray-600')
  })

  it('pathが/usersの場合、利用者一覧ボタンのデザインが強調される', async () => {
    pathnameMock.mockReturnValue('/users')

    const { getByText } = render(await NavigationBar())

    expect(getByText('利用者一覧')).toHaveClass('bg-gray-600')
  })

  it('pathが/users/ログインユーザーのidの場合、マイページボタンのデザインが強調される', async () => {
    pathnameMock.mockReturnValue(`/users/${loggedInUser.id}`)

    const { getByText, rerender } = render(await NavigationBar())

    expect(getByText('マイページ')).toHaveClass('bg-gray-600')

    // ログインユーザー以外のIDの場合強調されない
    pathnameMock.mockReturnValue({
      push: jest.fn(),
      asPath: `/users/${loggedInUser.id + 1}`,
    })
    rerender(await NavigationBar())
    expect(getByText('マイページ')).not.toHaveClass('bg-gray-600')
  })
})
