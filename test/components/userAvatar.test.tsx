import { render } from '@testing-library/react'
import { oldUser1, oldUser2 } from '../__utils__/data/user'
import UserAvatar from '@/components/userAvatar'

describe('UserCard component', () => {
  it('ユーザー画像が表示されること', () => {
    const { getByTestId } = render(<UserAvatar user={oldUser1} />)

    expect(getByTestId('profileImage')).toBeInTheDocument()
  })

  it('ユーザー画像が存在しない場合は、ユーザー名先頭1文字のアイコンが表示されること', () => {
    const { queryByTestId, getByText } = render(<UserAvatar user={oldUser2} />)

    expect(queryByTestId('profileImage')).not.toBeInTheDocument()
    expect(getByText(oldUser2.name.substring(0, 1))).toBeInTheDocument()
  })

  it('ホバーさせると、ツールチップでユーザー名が表示されること', async () => {
    const user = oldUser2
    const { queryByText, getByTestId } = render(<UserAvatar user={user} />)
    expect(queryByText(user.name)).not.toBeInTheDocument()

    expect(getByTestId('name-tooltip')).toHaveClass('tooltip')
  })
})
