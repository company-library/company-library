import { render } from '@testing-library/react'
import User from '@/components/user'

describe('UserDetail component', () => {
  const userId = 1
  const useGetUserQueryMock = jest
    .spyOn(require('@/generated/graphql.client'), 'useGetUserByIdQuery')
    .mockReturnValue([{
      fetching: false,
      error: false,
      data: {
        users_by_pk: {
          name: 'テスト太郎',
          lendingHistories: [
            { returnHistories_aggregate: { aggregate: { count: 0 } } },
            { returnHistories_aggregate: { aggregate: { count: 0 } } },
            { returnHistories_aggregate: { aggregate: { count: 0 } } },
            { returnHistories_aggregate: { aggregate: { count: 1 } } },
            { returnHistories_aggregate: { aggregate: { count: 1 } } }
          ]
        }
      }
    }])

  it('ユーザーの情報が表示される', async () => {
    const { getByText } = render(<User id={userId} />)

    expect(getByText('テスト太郎さんの情報')).toBeInTheDocument()
    expect(getByText('現在読んでいる書籍(3冊)'))
    expect(getByText('今まで読んだ書籍(2冊)'))
  })

  it('ユーザー情報の読み込み中は、「Loading...」というメッセージが表示される', async () => {
    useGetUserQueryMock.mockReturnValueOnce([{ fetching: true }])

    const { getByText } = render(<User id={userId} />)

    expect(getByText('Loading...')).toBeInTheDocument()
  })

  it('ユーザー情報の読み込みでエラーが発生した場合は、「Error!」というメッセージが表示される', () => {
    const expectedErrorMsg = 'error has occurred!'
    useGetUserQueryMock.mockReturnValueOnce([{ fetching: false, error: expectedErrorMsg }])
    const consoleErrorMock = jest.fn()
    console.error = consoleErrorMock

    const { getByText } = render(<User id={userId} />)

    expect(getByText('Error!')).toBeInTheDocument()
    expect(consoleErrorMock).toBeCalledWith(expectedErrorMsg)
  })

  it('ユーザーが存在しない場合は、HTTPステータスコード404のエラーページが表示される', async () => {
    useGetUserQueryMock.mockReturnValueOnce([{ fetching: false, error: false, data: {} }])

    const { getByText } = render(<User id={userId} />)

    expect(getByText('404')).toBeInTheDocument()
  })
})
