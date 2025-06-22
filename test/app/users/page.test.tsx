import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import UsersPage from '@/app/users/page'
import { user1, user2 } from '../../__utils__/data/user'
import { prismaMock } from '../../__utils__/libs/prisma/singleton'

describe('users page', async () => {
  prismaMock.user.findMany.mockResolvedValue([user1, user2])

  const { UserCardMock } = vi.hoisted(() => {
    return {
      UserCardMock: vi.fn().mockImplementation(({ user }) => <div>{user.name}</div>),
    }
  })
  vi.mock('@/app/users/userCard', () => ({
    default: (...args: unknown[]) => UserCardMock(...args),
  }))

  it('利用者一覧が表示される', async () => {
    render(
      <Suspense>
        <UsersPage />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByRole('heading')).toHaveTextContent('利用者一覧')
    expect(screen.getByText(user1.name)).toBeInTheDocument()
    expect(screen.getByText(user2.name)).toBeInTheDocument()
  })

  it('利用者一覧の読み込みに失敗した場合、「Error!」と表示される', async () => {
    const expectErrorMsg = 'query has errored!'
    console.error = vi.fn()
    prismaMock.user.findMany.mockRejectedValue(expectErrorMsg)

    render(
      <Suspense>
        <UsersPage />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText('Error!')).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectErrorMsg)
  })
})
