import { render, screen } from '@testing-library/react'
import { prismaMock } from '../../__utils__/libs/prisma/singleton'
import { user1, user2 } from '../../__utils__/data/user'
import { Suspense } from 'react'

describe('users page', async () => {
  prismaMock.user.findMany.mockResolvedValue([user1, user2])

  const { UserCardMock } = vi.hoisted(() => {
    return {
      UserCardMock: vi.fn().mockImplementation(({ user }) => <div>{user.name}</div>),
    }
  })
  vi.mock('@/app/users/userCard', () => ({
    default: (...args: any) => UserCardMock(...args),
  }))

  const UserPage = (await import('@/app/users/page')).default

  it('利用者一覧が表示される', async () => {
    render(
      <Suspense>
        <UserPage />
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
        <UserPage />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText('Error!')).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectErrorMsg)
  })
})
