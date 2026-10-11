import { act, fireEvent, render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import UserCard from '@/app/users/userCard'
import { user1 } from '../../../test/__utils__/data/user'

vi.mock('@/components/userAvatar', () => ({
  default: () => <div data-testid="profileImage">userAvatar</div>,
}))

describe('UserCard component', async () => {
  it('ユーザー情報が表示されていること', async () => {
    await act(async () => {
      render(
        <Suspense>
          <UserCard user={user1} />
        </Suspense>,
      )
    })

    expect(screen.getByText(user1.name)).toBeInTheDocument()
    expect(screen.getByText(user1.email)).toBeInTheDocument()
    expect(screen.getByTestId('profileImage')).toBeInTheDocument()
    expect(screen.getByTestId('userProfileLink')).toHaveAttribute('href', `/users/${user1.id}`)
    expect(screen.getByTestId('readingBookCount').textContent).toBe('3')
    expect(screen.getByTestId('haveReadBookCount').textContent).toBe('4')

    fireEvent.click(screen.getByText(user1.name))
  })
})
