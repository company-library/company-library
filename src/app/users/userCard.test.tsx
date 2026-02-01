import { fireEvent, render, screen } from '@testing-library/react'
import UserCardClient from '@/app/users/userCardClient'
import { user1 } from '../../../test/__utils__/data/user'

vi.mock('@/components/userAvatar', () => ({
  default: () => <div data-testid="profileImage">userAvatar</div>,
}))

describe('UserCardClient component', () => {
  it('ユーザー情報が表示されていること', () => {
    render(<UserCardClient user={user1} readingBookCount={3} haveReadBookCount={4} />)

    expect(screen.getByText(user1.name)).toBeInTheDocument()
    expect(screen.getByText(user1.email)).toBeInTheDocument()
    expect(screen.getByTestId('profileImage')).toBeInTheDocument()
    expect(screen.getByTestId('userProfileLink')).toHaveAttribute('href', `/users/${user1.id}`)
    expect(screen.getByTestId('readingBookCount').textContent).toBe('3')
    expect(screen.getByTestId('haveReadBookCount').textContent).toBe('4')

    fireEvent.click(screen.getByText(user1.name))
  })
})
