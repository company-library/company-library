import { render, screen } from '@testing-library/react'
import { user1 } from '../../../__utils__/data/user'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'

describe('UserDetail page', () => {
  const expectedUser = user1

  const UserDetailPage = require('@/app/users/[id]/page').default

  jest.mock('@/app/users/[id]/bookList', () => ({
    __esModule: true,
    default: () => <div>BookList</div>,
  }))

  it('ユーザーの情報が表示される', async () => {
    prismaMock.user.findUnique.mockResolvedValue(expectedUser)

    const { getByText } = render(await UserDetailPage({ params: { id: '1' } }))

    expect(getByText('テスト太郎さんの情報')).toBeInTheDocument()
    expect(getByText('現在読んでいる書籍(3冊)'))
    expect(getByText('今まで読んだ書籍(4冊)'))
  })

  it('クエリにidがない場合は、「Error!」と表示される', async () => {
    render(await UserDetailPage({ params: {} }))

    expect(screen.getByText('Error!')).toBeInTheDocument()
  })

  it('該当するidのユーザーがない場合は、「Error!」と表示される', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    render(await UserDetailPage({ params: { id: '1' } }))

    expect(screen.getByText('Error!')).toBeInTheDocument()
  })

  it('利用者一覧の読み込みに失敗した場合、「Error!」と表示される', async () => {
    const expectErrorMsg = 'query has errored!'
    console.error = jest.fn()
    prismaMock.user.findUnique.mockRejectedValueOnce(expectErrorMsg)

    render(await UserDetailPage({ params: { id: '1' } }))

    expect(screen.getByText('Error!')).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectErrorMsg)
  })
})
