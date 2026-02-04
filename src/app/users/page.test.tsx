import { render, screen } from '@testing-library/react'
import UsersClient from '@/app/users/usersClient'
import { user1, user2 } from '../../../test/__utils__/data/user'

const { UserCardClientMock } = vi.hoisted(() => {
  return {
    UserCardClientMock: vi.fn().mockImplementation(({ user }) => <div>{user.name}</div>),
  }
})
vi.mock('@/app/users/userCardClient', () => ({
  default: (...args: unknown[]) => UserCardClientMock(...args),
}))

describe('UsersClient component', () => {
  it('利用者一覧が表示される', () => {
    const usersWithCounts = [
      { user: user1, readingBookCount: 3, haveReadBookCount: 4, avatarUrl: undefined },
      { user: user2, readingBookCount: 1, haveReadBookCount: 2, avatarUrl: undefined },
    ]

    render(<UsersClient usersWithCounts={usersWithCounts} />)

    expect(screen.getByRole('heading')).toHaveTextContent('利用者一覧')
    expect(screen.getByText(user1.name)).toBeInTheDocument()
    expect(screen.getByText(user2.name)).toBeInTheDocument()
  })
})
