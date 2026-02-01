import { render, screen } from '@testing-library/react'
import NavigationBarClient from '@/app/navigationBarClient'
import { user1 } from '../../test/__utils__/data/user'

const { pathnameMock } = vi.hoisted(() => {
  return { pathnameMock: vi.fn() }
})
vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
}))

const { UserAvatarMock } = vi.hoisted(() => {
  return { UserAvatarMock: vi.fn().mockImplementation(() => <div>userAvatar</div>) }
})
vi.mock('@/components/userAvatar', () => ({
  default: (...args: unknown[]) => UserAvatarMock(...args),
}))

describe('NavigationBarClient component', () => {
  const loggedInUser = {
    id: user1.id,
    name: user1.name,
    email: user1.email,
  }

  beforeEach(() => {
    pathnameMock.mockReturnValue('/other')
  })

  it('ナビゲーション項目が表示される', () => {
    render(<NavigationBarClient user={loggedInUser} />)

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

  it('company-libraryをクリックすると書籍一覧画面へ遷移する', () => {
    render(<NavigationBarClient user={loggedInUser} />)

    expect(screen.getByText('company-library')).toHaveAttribute('href', '/')
  })

  it('pathが/の場合、書籍一覧ボタンのデザインが強調される', () => {
    pathnameMock.mockReturnValue('/')

    render(<NavigationBarClient user={loggedInUser} />)

    expect(screen.getByRole('link', { name: '書籍一覧' })).toHaveClass('bg-gray-600')
  })

  it('pathが/books/registerの場合、登録ボタンのデザインが強調される', () => {
    pathnameMock.mockReturnValue('/books/register')

    render(<NavigationBarClient user={loggedInUser} />)

    expect(screen.getByRole('link', { name: '登録' })).toHaveClass('bg-gray-600')
  })

  it('pathが/usersの場合、利用者一覧ボタンのデザインが強調される', () => {
    pathnameMock.mockReturnValue('/users')

    render(<NavigationBarClient user={loggedInUser} />)

    expect(screen.getByRole('link', { name: '利用者一覧' })).toHaveClass('bg-gray-600')
  })

  it('pathが/users/ログインユーザーのidの場合、マイページボタンのデザインが強調される', () => {
    pathnameMock.mockReturnValue(`/users/${loggedInUser.id}`)

    const { rerender } = render(<NavigationBarClient user={loggedInUser} />)

    expect(screen.getByRole('link', { name: 'マイページ' })).toHaveClass('bg-gray-600')

    // ログインユーザー以外のIDの場合強調されない
    pathnameMock.mockReturnValue(`/users/${loggedInUser.id + 1}`)
    rerender(<NavigationBarClient user={loggedInUser} />)

    expect(screen.getByRole('link', { name: 'マイページ' })).not.toHaveClass('bg-gray-600')
  })

  it('ログインユーザーのアバターが表示される', () => {
    render(<NavigationBarClient user={loggedInUser} />)

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
