import { user1, user2 } from '../../__utils__/data/user'
import Layout from '@/components/layout'
import { render } from '@testing-library/react'

jest.mock('@/components/layout')

const useGetUsersQueryMock = jest
  .fn()
  .mockReturnValue([{ fetching: false, error: false, data: { users: [user1, user2] } }])
jest.mock('@/generated/graphql.client', () => ({
  __esModule: true,
  useGetUsersQuery: () => useGetUsersQueryMock(),
}))

describe('users page', () => {
  const LayoutMock = (Layout as jest.Mock).mockImplementation(({ children }) => {
    return <div>{children}</div>
  })

  const UsersPage = require('@/pages/users/index').default

  it('利用者一覧が表示される', () => {
    const { getByText } = render(<UsersPage />)

    expect(LayoutMock.mock.calls[0][0].title).toBe('利用者一覧 | company-library')
    expect(getByText('利用者一覧')).toBeInTheDocument()
    expect(getByText(user1.name)).toBeInTheDocument()
    expect(getByText(user2.name)).toBeInTheDocument()
  })

  it('利用者一覧の読み込み中は「Loading...」と表示される', () => {
    useGetUsersQueryMock.mockReturnValueOnce([{ fetching: true }])

    const { getByText } = render(<UsersPage />)

    expect(getByText('Loading...')).toBeInTheDocument()
  })

  it('利用者一覧の読み込みに失敗した場合、「Error!」と表示される', () => {
    const expectErrorMsg = 'query has errored!'
    console.error = jest.fn()
    useGetUsersQueryMock.mockReturnValueOnce([{ fetching: false, error: expectErrorMsg }])
    const { getByText, rerender } = render(<UsersPage />)
    expect(getByText('Error!')).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectErrorMsg)

    useGetUsersQueryMock.mockReturnValueOnce([{ fetching: false, error: false, data: undefined }])
    rerender(<UsersPage />)
    expect(getByText('Error!')).toBeInTheDocument()
    // errorがfalseの場合は、console.errorが呼び出されない
    expect(console.error).toBeCalledTimes(1)
  })
})
