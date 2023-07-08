import { fireEvent, render } from '@testing-library/react'
import UserCard from '@/components/userCard'
import { oldUser1, oldUser2 } from '../__utils__/data/user'

jest.mock('next/link', () => ({
  __esModule: true,
  default: (props: any) => {
    return <a {...props} />
  },
}))

describe('UserCard component', () => {
  it('ユーザー情報が表示されていること', () => {
    const { getByText, getByTestId } = render(<UserCard user={oldUser1} />)

    expect(getByText(oldUser1.name)).toBeInTheDocument()
    expect(getByText(oldUser1.email)).toBeInTheDocument()
    expect(getByTestId('profileImage')).toBeInTheDocument()
    expect(getByTestId('userProfileLink')).toHaveAttribute('href', `/users/${oldUser1.id}`)
    expect(getByTestId('readingBookCount').textContent).toBe('3')
    expect(getByTestId('haveReadBookCount').textContent).toBe('4')

    fireEvent.click(getByText(oldUser1.name))
  })

  it('ユーザー画像が存在しない場合は、ユーザー画像は表示されない', () => {
    const { queryByTestId } = render(<UserCard user={oldUser2} />)

    expect(queryByTestId('profileImage')).not.toBeInTheDocument()
  })
})
