import { render } from '@testing-library/react'
import OldNavigationBar from '@/components/oldNavigationBar'
import { oldUser1 } from '../__utils__/data/user'

const routerMock = jest.fn().mockReturnValue({ push: jest.fn() })
jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => routerMock(),
}))
const loggedInUser = oldUser1
jest.mock('@/hooks/useCustomUser', () => ({
  __esModule: true,
  useCustomUser: () => ({ user: loggedInUser }),
}))

describe('navigationBar component', () => {
  it('ナビゲーション項目が表示される', () => {
    const { getByText } = render(<OldNavigationBar />)

    expect(getByText('company-library')).toBeInTheDocument()
    expect(getByText('書籍一覧')).toBeInTheDocument()
    expect(getByText('書籍一覧')).not.toHaveClass('bg-gray-600')
    expect(getByText('登録')).toBeInTheDocument()
    expect(getByText('登録')).not.toHaveClass('bg-gray-600')
    expect(getByText('未返却一覧')).toBeInTheDocument()
    expect(getByText('未返却一覧')).not.toHaveClass('bg-gray-600')
    expect(getByText('利用者一覧')).toBeInTheDocument()
    expect(getByText('利用者一覧')).not.toHaveClass('bg-gray-600')
  })

  it('pathが/books/registerの場合、登録ボタンのデザインが強調される', () => {
    routerMock.mockReturnValueOnce({
      push: jest.fn(),
      pathname: '/books/register',
    })

    const { getByText } = render(<OldNavigationBar />)

    expect(getByText('登録')).toHaveClass('bg-gray-600')
  })

  it('pathが/usersの場合、利用者一覧ボタンのデザインが強調される', () => {
    routerMock.mockReturnValueOnce({
      push: jest.fn(),
      pathname: '/users',
    })

    const { getByText } = render(<OldNavigationBar />)

    expect(getByText('利用者一覧')).toHaveClass('bg-gray-600')
  })

  it('pathが/users/ログインユーザーのidの場合、未返却一覧ボタンのデザインが強調される', () => {
    routerMock.mockReturnValueOnce({
      push: jest.fn(),
      asPath: `/users/${loggedInUser.id}`,
    })

    const { getByText, rerender } = render(<OldNavigationBar />)

    expect(getByText('未返却一覧')).toHaveClass('bg-gray-600')

    // ログインユーザー以外のIDの場合強調されない
    routerMock.mockReturnValueOnce({
      push: jest.fn(),
      asPath: `/users/${loggedInUser.id + 1}`,
    })
    rerender(<OldNavigationBar />)
    expect(getByText('未返却一覧')).not.toHaveClass('bg-gray-600')
  })
})
