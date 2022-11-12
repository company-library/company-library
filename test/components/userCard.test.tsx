import { render } from '@testing-library/react'
import UserCard from '@/components/userCard'
import { user1, user2 } from '../__utils__/data/user'

describe('UserCard component', () => {
  it('ユーザー情報が表示されていること', () => {
    const { getByText, getByTestId } = render(<UserCard user={user1} />)

    expect(getByText(user1.name)).toBeInTheDocument()
    expect(getByText(user1.email)).toBeInTheDocument()
    expect(getByTestId('profileImage')).toBeInTheDocument()
    expect(getByTestId('haveReadBookCount').textContent).toBe('2')
    expect(getByTestId('readingBookCount').textContent).toBe('1')
  })

  it('ユーザー画像が存在しない場合は、ユーザー画像は表示されない', () => {
    const { queryByTestId } = render(<UserCard user={user2} />)

    expect(queryByTestId('profileImage')).not.toBeInTheDocument()
  })
})
