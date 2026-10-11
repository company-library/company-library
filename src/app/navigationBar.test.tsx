import { act, render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import NavigationBar from '@/app/navigationBar'
import { user1 } from '../../test/__utils__/data/user'

const { pathnameMock } = vi.hoisted(() => {
  return { pathnameMock: vi.fn() }
})

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
}))

const { getServerSessionMock } = vi.hoisted(() => {
  return { getServerSessionMock: vi.fn() }
})

vi.mock('next-auth', () => ({
  getServerSession: () => getServerSessionMock(),
}))

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}))

const { UserAvatarMock } = vi.hoisted(() => {
  return { UserAvatarMock: vi.fn().mockImplementation(() => <div>userAvatar</div>) }
})

vi.mock('@/components/userAvatar', () => ({
  default: (...args: unknown[]) => UserAvatarMock(...args),
}))

describe('navigationBar component', async () => {
  const loggedInUser = user1

  beforeEach(() => {
    pathnameMock.mockReturnValue({ push: vi.fn() })
    getServerSessionMock.mockReturnValue({
      customUser: { id: loggedInUser.id, name: loggedInUser.name, email: loggedInUser.email },
    })
  })

  it('ナビゲーション項目が表示される', async () => {
    await act(async () => {
      render(
        <Suspense>
          <NavigationBar />
        </Suspense>,
      )
    })

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
    await act(async () => {
      render(
        <Suspense>
          <NavigationBar />
        </Suspense>,
      )
    })

    expect(screen.getByText('company-library')).toHaveAttribute('href', '/')
  })

  it('pathが/の場合、書籍一覧ボタンのデザインが強調される', async () => {
    pathnameMock.mockReturnValue('/')

    await act(async () => {
      render(
        <Suspense>
          <NavigationBar />
        </Suspense>,
      )
    })

    expect(screen.getByRole('link', { name: '書籍一覧' })).toHaveClass('bg-gray-600')
  })

  it('pathが/books/registerの場合、登録ボタンのデザインが強調される', async () => {
    pathnameMock.mockReturnValue('/books/register')

    await act(async () => {
      render(
        <Suspense>
          <NavigationBar />
        </Suspense>,
      )
    })

    expect(screen.getByRole('link', { name: '登録' })).toHaveClass('bg-gray-600')
  })

  it('pathが/usersの場合、利用者一覧ボタンのデザインが強調される', async () => {
    pathnameMock.mockReturnValue('/users')

    await act(async () => {
      render(
        <Suspense>
          <NavigationBar />
        </Suspense>,
      )
    })

    expect(screen.getByRole('link', { name: '利用者一覧' })).toHaveClass('bg-gray-600')
  })

  it('pathが/users/ログインユーザーのidの場合、マイページボタンのデザインが強調される', async () => {
    pathnameMock.mockReturnValue(`/users/${loggedInUser.id}`)

    let rerender: (ui: React.ReactElement) => void
    await act(async () => {
      const result = render(
        <Suspense>
          <NavigationBar />
        </Suspense>,
      )
      rerender = result.rerender
    })

    expect(screen.getByRole('link', { name: 'マイページ' })).toHaveClass('bg-gray-600')

    // ログインユーザー以外のIDの場合強調されない
    pathnameMock.mockReturnValue({
      push: vi.fn(),
      asPath: `/users/${loggedInUser.id + 1}`,
    })
    await act(async () => {
      rerender(
        <Suspense>
          <NavigationBar />
        </Suspense>,
      )
    })

    expect(screen.getByRole('link', { name: 'マイページ' })).not.toHaveClass('bg-gray-600')
  })

  it('ログインユーザーのアバターが表示される', async () => {
    await act(async () => {
      render(
        <Suspense>
          <NavigationBar />
        </Suspense>,
      )
    })

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
