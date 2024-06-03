import { fireEvent, render, screen } from '@testing-library/react'
import { user1 } from '../../__utils__/data/user'

vi.mock('next/link', () => ({
  __esModule: true,
  default: (props: any) => {
    return <a {...props} />
  },
}))

describe('UserCard component', () => {
  const UserAvatarMock = vi
    .fn()
    .mockImplementation(() => <div data-testid="profileImage">userAvatar</div>)
  vi.mock('@/components/userAvatar', () => ({
    __esModule: true,
    default: (...args: any) => UserAvatarMock(...args),
  }))

  const UserCard = require('@/app/users/userCard').default

  it('ユーザー情報が表示されていること', async () => {
    render(await UserCard({ user: user1 }))

    expect(screen.getByText(user1.name)).toBeInTheDocument()
    expect(screen.getByText(user1.email)).toBeInTheDocument()
    expect(screen.getByTestId('profileImage')).toBeInTheDocument()
    expect(screen.getByTestId('userProfileLink')).toHaveAttribute('href', `/users/${user1.id}`)
    expect(screen.getByTestId('readingBookCount').textContent).toBe('3')
    expect(screen.getByTestId('haveReadBookCount').textContent).toBe('4')

    fireEvent.click(screen.getByText(user1.name))
  })
})
