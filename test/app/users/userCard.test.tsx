import { fireEvent, render, screen } from '@testing-library/react'
import { user1 } from '../../__utils__/data/user'
import { Suspense } from 'react'
import UserCard from '@/app/users/userCard'

describe('UserCard component', async () => {
  vi.mock('next/link', () => ({
    default: (props: any) => {
      return <a {...props} />
    },
  }))

  vi.mock('@/components/userAvatar', () => ({
    default: (...args: any) => <div data-testid="profileImage">userAvatar</div>,
  }))

  it('ユーザー情報が表示されていること', async () => {
    render(
      <Suspense>
        <UserCard user={user1} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText(user1.name)).toBeInTheDocument()
    expect(screen.getByText(user1.email)).toBeInTheDocument()
    expect(screen.getByTestId('profileImage')).toBeInTheDocument()
    expect(screen.getByTestId('userProfileLink')).toHaveAttribute('href', `/users/${user1.id}`)
    expect(screen.getByTestId('readingBookCount').textContent).toBe('3')
    expect(screen.getByTestId('haveReadBookCount').textContent).toBe('4')

    fireEvent.click(screen.getByText(user1.name))
  })
})
