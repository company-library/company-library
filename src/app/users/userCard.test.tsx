import { fireEvent, render, screen } from '@testing-library/react'
import UserCardClient from '@/app/users/userCardClient'
import { user1 } from '../../../test/__utils__/data/user'

describe('UserCardClient component', () => {
  it('ユーザー情報が表示されていること', () => {
    render(
      <UserCardClient
        user={user1}
        readingBookCount={3}
        haveReadBookCount={4}
        avatarUrl={undefined}
      />,
    )

    expect(screen.getByText(user1.name)).toBeInTheDocument()
    expect(screen.getByText(user1.email)).toBeInTheDocument()
    const avatar = screen.getByAltText(user1.name)
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', expect.stringContaining('no_image.jpg'))
    expect(screen.getByTestId('userProfileLink')).toHaveAttribute('href', `/users/${user1.id}`)
    expect(screen.getByTestId('readingBookCount').textContent).toBe('3')
    expect(screen.getByTestId('haveReadBookCount').textContent).toBe('4')

    fireEvent.click(screen.getByText(user1.name))
  })
})
