import { render } from '@testing-library/react'
import User from '@/app/users/[id]/user'

const useGetUserByIdQueryMock = jest.fn().mockReturnValue([
  {
    fetching: false,
    error: false,
    data: {
      users_by_pk: {
        name: 'テスト太郎',
        lendingHistories: [
          { bookId: 1, returnHistories_aggregate: { aggregate: { count: 0 } } },
          { bookId: 1, returnHistories_aggregate: { aggregate: { count: 0 } } },
          { bookId: 2, returnHistories_aggregate: { aggregate: { count: 0 } } },
          { bookId: 3, returnHistories_aggregate: { aggregate: { count: 0 } } },
          { bookId: 3, returnHistories_aggregate: { aggregate: { count: 1 } } },
          { bookId: 4, returnHistories_aggregate: { aggregate: { count: 1 } } },
          { bookId: 4, returnHistories_aggregate: { aggregate: { count: 1 } } },
          { bookId: 5, returnHistories_aggregate: { aggregate: { count: 1 } } },
          { bookId: 6, returnHistories_aggregate: { aggregate: { count: 1 } } },
        ],
      },
    },
  },
])

jest.mock('@/generated/graphql.client', () => ({
  __esModule: true,
  useGetUserByIdQuery: () => useGetUserByIdQueryMock(),
}))

jest.mock('@/components/bookList')

describe('UserDetail component', () => {
  const userId = 1

  it('ユーザーの情報が表示される', async () => {
    const { getByText } = render(<User id={userId} />)

    expect(getByText('テスト太郎さんの情報')).toBeInTheDocument()
    expect(getByText('現在読んでいる書籍(3冊)'))
    expect(getByText('今まで読んだ書籍(4冊)'))
  })

  it('ユーザー情報の読み込み中は、「Loading...」というメッセージが表示される', async () => {
    useGetUserByIdQueryMock.mockReturnValueOnce([{ fetching: true }])

    const { getByText } = render(<User id={userId} />)

    expect(getByText('Loading...')).toBeInTheDocument()
  })

  it('ユーザー情報の読み込みでエラーが発生した場合は、HTTPステータスコード500のエラーページが表示される', () => {
    const expectedErrorMsg = 'error has occurred!'
    useGetUserByIdQueryMock.mockReturnValueOnce([{ fetching: false, error: expectedErrorMsg }])
    const consoleErrorMock = jest.fn()
    console.error = consoleErrorMock

    const { getByText } = render(<User id={userId} />)

    expect(getByText('500')).toBeInTheDocument()
    expect(consoleErrorMock).toBeCalledWith(expectedErrorMsg)
  })

  it('ユーザーが存在しない場合は、HTTPステータスコード404のエラーページが表示される', async () => {
    useGetUserByIdQueryMock.mockReturnValueOnce([{ fetching: false, error: false, data: {} }])

    const { getByText } = render(<User id={userId} />)

    expect(getByText('404')).toBeInTheDocument()
  })
})
