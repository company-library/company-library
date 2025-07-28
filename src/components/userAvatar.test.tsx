import { render, screen } from '@testing-library/react'
import UserAvatar from '@/components/userAvatar'
import { user1, user2 } from '../../test/__utils__/data/user'

describe('UserAvatar component', async () => {
  const { getAvatarUrlMock } = vi.hoisted(() => {
    return {
      getAvatarUrlMock: vi.fn(),
    }
  })
  vi.mock('@/libs/gravatar/getAvatarUrl', () => ({
    getAvatarUrl: (email: string) => getAvatarUrlMock(email),
  }))

  it('ユーザー画像が表示されること', async () => {
    getAvatarUrlMock.mockResolvedValue(user1.imageUrl)

    render(await UserAvatar({ user: user1 }))

    expect(screen.getByTestId('profileImage')).toBeInTheDocument()
  })

  it('ユーザー画像が存在しない場合は、ユーザー名先頭1文字のアイコンが表示されること', async () => {
    getAvatarUrlMock.mockResolvedValue(undefined)

    render(await UserAvatar({ user: user2 }))

    expect(screen.getByText(user2.name.substring(0, 1))).toBeInTheDocument()
    expect(screen.queryByTestId('profileImage')).not.toBeInTheDocument()
  })

  it('linkToProfile が true の場合、リンクが表示されること', async () => {
    getAvatarUrlMock.mockResolvedValue(user1.imageUrl)

    render(await UserAvatar({ user: user1, linkToProfile: true }))

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', `/users/${encodeURIComponent(user1.email)}`)
  })

  it.each([
    {
      case: 'linkToProfile が false の場合',
      linkToProfile: false,
      expectLink: false,
    },
    {
      case: 'linkToProfile が undefined（デフォルト）の場合',
      linkToProfile: undefined,
      expectLink: false,
    },
  ])('$case、リンクが表示されないこと', async ({ linkToProfile }) => {
    getAvatarUrlMock.mockResolvedValue(user1.imageUrl)

    render(await UserAvatar({ user: user1, linkToProfile }))

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  describe.each([
    { case: 'ユーザー画像が存在する場合', avatarUrl: user1.imageUrl },
    { case: 'ユーザー画像が存在しない場合', avatarUrl: undefined },
  ])('$case', ({ avatarUrl }) => {
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
        assert(size === 'sm' || size === 'md' || size === 'lg' || size === undefined)
        getAvatarUrlMock.mockResolvedValue(avatarUrl)

        render(await UserAvatar({ user: user1, size }))

        expect(screen.getByTestId('width')).toHaveClass(expectedWidth)
      },
    )

    it.each([{ tooltip: undefined }, { tooltip: 'none' }])(
      'tooltipプロップスが $tooltip の場合、 ツールチップが表示されないこと',
      async ({ tooltip }) => {
        assert(tooltip === undefined || tooltip === 'none')
        getAvatarUrlMock.mockResolvedValue(avatarUrl)

        render(await UserAvatar({ user: user1, tooltip }))

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
        assert(
          tooltip === 'top' || tooltip === 'bottom' || tooltip === 'left' || tooltip === 'right',
        )
        getAvatarUrlMock.mockResolvedValue(avatarUrl)

        render(await UserAvatar({ user: user1, tooltip }))

        expect(screen.getByTestId('name-tooltip')).toHaveClass(...expectedClasses)
        expect(screen.getByTestId('name-tooltip')).toHaveAttribute('data-tip', user1.name)
      },
    )
  })
})
