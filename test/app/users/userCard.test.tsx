import { fireEvent, render } from '@testing-library/react'
import UserCard from '@/app/users/userCard'
import { user1, user2 } from '../../__utils__/data/user'

jest.mock('next/link', () => ({
  __esModule: true,
  default: (props: any) => {
    return <a {...props} />
  },
}))

describe('UserCard component', () => {
  it('ユーザー情報が表示されていること', () => {
    const { getByText, getByTestId } = render(<UserCard user={user1} />)

    expect(getByText(user1.name)).toBeInTheDocument()
    expect(getByText(user1.email)).toBeInTheDocument()
    expect(getByTestId('profileImage')).toBeInTheDocument()
    expect(getByTestId('userProfileLink')).toHaveAttribute('href', `/users/${user1.id}`)
    expect(getByTestId('readingBookCount').textContent).toBe('3')
    expect(getByTestId('haveReadBookCount').textContent).toBe('4')

    fireEvent.click(getByText(user1.name))
  })

  it('ユーザー画像が存在しない場合は、ユーザー画像は表示されない', () => {
    const { queryByTestId } = render(<UserCard user={user2} />)

    expect(queryByTestId('profileImage')).not.toBeInTheDocument()
  })
})
