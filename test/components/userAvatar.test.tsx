import { render, screen } from '@testing-library/react'
import { user1, user2 } from '../__utils__/data/user'

describe('UserAvatar component', () => {
  const getAvatarUrlMock = jest.fn()
  jest.mock('@/libs/gravatar/getAvatarUrl', () => ({
    __esModule: true,
    getAvatarUrl: (email: string) => getAvatarUrlMock(email),
  }))

  const UserAvatar = require('@/components/userAvatar').default

  it('ユーザー画像が表示されること', async () => {
    getAvatarUrlMock.mockResolvedValueOnce(user1.imageUrl)

    render(await UserAvatar({ user: user1 }))

    expect(screen.getByTestId('profileImage')).toBeInTheDocument()
  })

  it('ユーザー画像が存在しない場合は、ユーザー名先頭1文字のアイコンが表示されること', async () => {
    getAvatarUrlMock.mockResolvedValueOnce(undefined)

    render(await UserAvatar({ user: user2 }))

    expect(screen.queryByTestId('profileImage')).not.toBeInTheDocument()
    expect(screen.getByText(user2.name.substring(0, 1))).toBeInTheDocument()
  })

  it('ホバーさせると、ツールチップでユーザー名が表示されること', async () => {
    getAvatarUrlMock.mockResolvedValueOnce(user1.imageUrl)

    const user = user1
    render(await UserAvatar({ user: user1 }))
    expect(screen.queryByText(user.name)).not.toBeInTheDocument()

    expect(screen.getByTestId('name-tooltip')).toHaveClass('tooltip')
  })
})
