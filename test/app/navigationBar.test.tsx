import { render, screen } from '@testing-library/react'
import { user1 } from '../__utils__/data/user'

const pathnameMock = jest.fn().mockReturnValue({ push: jest.fn() })
jest.mock('next/navigation', () => ({
  __esModule: true,
  usePathname: () => pathnameMock(),
}))

const loggedInUser = user1
const getServerSessionMock = jest.fn().mockReturnValue({
  customUser: { id: loggedInUser.id, name: loggedInUser.name, email: loggedInUser.email },
})
jest.mock('next-auth', () => ({
  __esModule: true,
  getServerSession: () => getServerSessionMock(),
}))

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  __esModule: true,
  authOptions: {},
}))

const UserAvatarMock = jest.fn().mockImplementation(() => <div>userAvatar</div>)
jest.mock('@/components/userAvatar', () => ({
  __esModule: true,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  default: (...args: any) => UserAvatarMock(...args),
}))

describe('navigationBar component', () => {
  const NavigationBar = require('@/app/navigationBar').default

  it('ナビゲーション項目が表示される', async () => {
    render(await NavigationBar())

    expect(screen.getByText('company-library')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '書籍一覧' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '書籍一覧' })).not.toHaveClass('bg-gray-600')
    expect(screen.getByRole('link', { name: '登録' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '登録' })).not.toHaveClass('bg-gray-600')
    expect(screen.getByRole('link', { name: 'マイページ' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'マイページ' })).not.toHaveClass('bg-gray-600')
    expect(screen.getByRole('link', { name: '利用者一覧' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '利用者一覧' })).not.toHaveClass('bg-gray-600')
    expect(screen.getByText(loggedInUser.name)).toBeInTheDocument()
  })

  it('company-libraryをクリックすると書籍一覧画面へ遷移する', async () => {
    render(await NavigationBar())

    expect(screen.getByText('company-library')).toHaveAttribute('href', '/')
  })

  it('pathが/の場合、書籍一覧ボタンのデザインが強調される', async () => {
    pathnameMock.mockReturnValue('/')

    render(await NavigationBar())

    expect(screen.getByRole('link', { name: '書籍一覧' })).toHaveClass('bg-gray-600')
  })

  it('pathが/books/registerの場合、登録ボタンのデザインが強調される', async () => {
    pathnameMock.mockReturnValue('/books/register')

    render(await NavigationBar())

    expect(screen.getByRole('link', { name: '登録' })).toHaveClass('bg-gray-600')
  })

  it('pathが/usersの場合、利用者一覧ボタンのデザインが強調される', async () => {
    pathnameMock.mockReturnValue('/users')

    render(await NavigationBar())

    expect(screen.getByRole('link', { name: '利用者一覧' })).toHaveClass('bg-gray-600')
  })

  it('pathが/users/ログインユーザーのidの場合、マイページボタンのデザインが強調される', async () => {
    pathnameMock.mockReturnValue(`/users/${loggedInUser.id}`)

    const { rerender } = render(await NavigationBar())

    expect(screen.getByRole('link', { name: 'マイページ' })).toHaveClass('bg-gray-600')

    // ログインユーザー以外のIDの場合強調されない
    pathnameMock.mockReturnValue({
      push: jest.fn(),
      asPath: `/users/${loggedInUser.id + 1}`,
    })
    rerender(await NavigationBar())
    expect(screen.getByRole('link', { name: 'マイページ' })).not.toHaveClass('bg-gray-600')
  })

  it('ログインユーザーのアバターが表示される', async () => {
    render(await NavigationBar())

    expect(screen.getByText('userAvatar')).toBeInTheDocument()
    expect(UserAvatarMock).toHaveBeenLastCalledWith(
      {
        user: { id: loggedInUser.id, name: loggedInUser.name, email: loggedInUser.email },
        size: 'sm',
      },
      undefined,
    )
  })
})
