import { render } from '@testing-library/react'
import NavigationBar from '@/app/navigationBar'
import { user1 } from '../__utils__/data/user'

const pathnameMock = jest.fn().mockReturnValue({ push: jest.fn() })
jest.mock('next/navigation', () => ({
  __esModule: true,
  usePathname: () => pathnameMock(),
}))
const loggedInUser = user1
jest.mock('@/hooks/useCustomUser', () => ({
  __esModule: true,
  useCustomUser: () => ({ user: loggedInUser }),
}))

describe('navigationBar component', () => {
  it('ナビゲーション項目が表示される', () => {
    const { getByText } = render(<NavigationBar userId={loggedInUser.id} />)

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

  it('pathが/の場合、書籍一覧ボタンのデザインが強調される', () => {
    pathnameMock.mockReturnValueOnce('/')

    const { getByText } = render(<NavigationBar userId={loggedInUser.id} />)

    expect(getByText('書籍一覧')).toHaveClass('bg-gray-600')
  })

  it('pathが/books/registerの場合、登録ボタンのデザインが強調される', () => {
    pathnameMock.mockReturnValueOnce('/books/register')

    const { getByText } = render(<NavigationBar userId={loggedInUser.id} />)

    expect(getByText('登録')).toHaveClass('bg-gray-600')
  })

  it('pathが/usersの場合、利用者一覧ボタンのデザインが強調される', () => {
    pathnameMock.mockReturnValueOnce('/users')

    const { getByText } = render(<NavigationBar userId={loggedInUser.id} />)

    expect(getByText('利用者一覧')).toHaveClass('bg-gray-600')
  })

  it('pathが/users/ログインユーザーのidの場合、マイページボタンのデザインが強調される', () => {
    pathnameMock.mockReturnValueOnce(`/users/${loggedInUser.id}`)

    const { getByText, rerender } = render(<NavigationBar userId={loggedInUser.id} />)

    expect(getByText('マイページ')).toHaveClass('bg-gray-600')

    // ログインユーザー以外のIDの場合強調されない
    pathnameMock.mockReturnValueOnce({
      push: jest.fn(),
      asPath: `/users/${loggedInUser.id + 1}`,
    })
    rerender(<NavigationBar userId={loggedInUser.id} />)
    expect(getByText('マイページ')).not.toHaveClass('bg-gray-600')
  })
})
