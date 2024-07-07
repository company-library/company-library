import UserAvatar from '@/components/userAvatar'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { user1, user2 } from '../__utils__/data/user'

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

    render(
      <Suspense>
        <UserAvatar user={user1} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByTestId('profileImage')).toBeInTheDocument()
  })

  it('ユーザー画像が存在しない場合は、ユーザー名先頭1文字のアイコンが表示されること', async () => {
    getAvatarUrlMock.mockResolvedValue(undefined)

    render(
      <Suspense>
        <UserAvatar user={user2} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText(user2.name.substring(0, 1))).toBeInTheDocument()
    expect(screen.queryByTestId('profileImage')).not.toBeInTheDocument()
  })

  describe.each([
    { case: 'ユーザー画像が存在する場合', avatarUrl: user1.imageUrl },
    { case: 'ユーザー画像が存在しない場合', avatarUrl: undefined },
  ])('$case', ({ avatarUrl }) => {
    beforeEach(() => {
      getAvatarUrlMock.mockResolvedValue(avatarUrl)
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
        assert(size === 'sm' || size === 'md' || size === 'lg' || size === undefined)

        render(
          <Suspense>
            <UserAvatar user={user1} size={size} />
          </Suspense>,
        )

        // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
        expect(await screen.findByTestId('width')).toHaveClass(expectedWidth)
      },
    )

    it.each([{ tooltip: undefined }, { tooltip: 'none' }])(
      'tooltipプロップスが $tooltip の場合、 ツールチップが表示されないこと',
      async ({ tooltip }) => {
        assert(tooltip === undefined || tooltip === 'none')

        render(
          <Suspense>
            <UserAvatar user={user1} tooltip={tooltip} />
          </Suspense>,
        )

        // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
        expect(await screen.findByTestId('name-tooltip')).not.toHaveClass('tooltip')
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
        const user = user1

        render(
          <Suspense>
            <UserAvatar user={user} tooltip={tooltip} />
          </Suspense>,
        )

        // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
        expect(await screen.findByTestId('name-tooltip')).toHaveClass(...expectedClasses)
        expect(screen.getByTestId('name-tooltip')).toHaveAttribute('data-tip', user.name)
      },
    )
  })
})
