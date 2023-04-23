import { render } from '@testing-library/react'
import UserPage from '@/pages/users/[id]'
import { user1 } from '../../__utils__/data/user'

const expectedUser = user1
const useRouterMock = jest.fn().mockReturnValue({ query: { id: expectedUser.id } })
jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => useRouterMock(),
}))

const LayoutMock = jest.fn().mockImplementation(({ children }) => {
  return <div>{children}</div>
})
jest.mock('@/components/layout', () => ({
  __esModule: true,
  default: (...args: any) => LayoutMock(...args),
}))

const UserDetailMock = jest.fn()
jest.mock('@/components/user', () => ({
  __esModule: true,
  default: (...args: any) => UserDetailMock(...args),
}))

describe('UserDetail page', () => {
  it('ユーザー情報が表示される', () => {
    render(<UserPage />)

    expect(LayoutMock.mock.calls[0][0]['title']).toBe(`利用者情報 | company-library`)
    expect(UserDetailMock.mock.calls[0][0]['id']).toBe(expectedUser.id)
  })

  it('クエリにidがない場合は、HTTPステータスコード400のエラーページが表示される', () => {
    useRouterMock.mockReturnValueOnce({ query: {} })

    const { getByText } = render(<UserPage />)

    expect(getByText('400')).toBeInTheDocument()
  })
})
