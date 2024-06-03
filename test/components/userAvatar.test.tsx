import { render, screen } from '@testing-library/react'
import { user1, user2 } from '../__utils__/data/user'

describe('UserAvatar component', () => {
  const getAvatarUrlMock = vi.fn()
  vi.mock('@/libs/gravatar/getAvatarUrl', () => ({
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

  describe.each([
    { case: 'ユーザー画像が存在する場合', avatarUrl: user1.imageUrl },
    { case: 'ユーザー画像が存在しない場合', avatarUrl: undefined },
  ])('$case', ({ avatarUrl }) => {
    beforeEach(() => {
      getAvatarUrlMock.mockResolvedValueOnce(avatarUrl)
    })

    it.each([
      {
        size: undefined,
        expectedWidth: 'w-12',
      },
      {
        size: 'sm',
        expectedWidth: 'w-8',
      },
      {
        size: 'md',
        expectedWidth: 'w-12',
      },
      {
        size: 'lg',
        expectedWidth: 'w-16',
      },
    ])(
      'sizeプロップスが $size の場合、 widthが $expectedWidth であること',
      async ({ size, expectedWidth }) => {
        render(await UserAvatar({ user: user1, size: size }))

        expect(screen.getByTestId('width')).toHaveClass(expectedWidth)
      },
    )

    it.each([{ tooltip: undefined }, { tooltip: 'none' }])(
      'tooltipプロップスが $tooltip の場合、 ツールチップが表示されないこと',
      async ({ tooltip }) => {
        render(await UserAvatar({ user: user1, tooltip: tooltip }))

        expect(screen.getByTestId('name-tooltip')).not.toHaveClass('tooltip')
      },
    )

    it.each([
      {
        tooltip: 'top',
        expectedClasses: ['tooltip', 'tooltip-top'],
      },
      {
        tooltip: 'bottom',
        expectedClasses: ['tooltip', 'tooltip-bottom'],
      },
      {
        tooltip: 'left',
        expectedClasses: ['tooltip', 'tooltip-left'],
      },
      {
        tooltip: 'right',
        expectedClasses: ['tooltip', 'tooltip-right'],
      },
    ])(
      'tooltipプロップスが $tooltip の場合、 ホバーさせるとツールチップでユーザー名が表示されること',
      async ({ tooltip, expectedClasses }) => {
        const user = user1

        render(await UserAvatar({ user: user, tooltip: tooltip }))

        expect(screen.getByTestId('name-tooltip')).toHaveClass(...expectedClasses)
        expect(screen.getByTestId('name-tooltip')).toHaveAttribute('data-tip', user.name)
      },
    )
  })
})
