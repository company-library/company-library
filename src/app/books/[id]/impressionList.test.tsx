import { render, screen, within } from '@testing-library/react'
import ImpressionList from '@/app/books/[id]/impressionList'
import { lendableBook } from '../../../../test/__utils__/data/book'
import { user1 } from '../../../../test/__utils__/data/user'
import { prismaMock } from '../../../../test/__utils__/libs/prisma/singleton'

describe('ImpressionList component', async () => {
  const UserAvatarMock = vi.hoisted(() =>
    vi.fn().mockImplementation(({ user }) => <div>{user.name}</div>),
  )
  vi.mock('@/components/userAvatar', () => ({
    default: (...args: unknown[]) => UserAvatarMock(...args),
  }))
  vi.mock(import('@/app/books/[id]/editImpressionButton'), () => ({
    default: () => {
      return <button type="button">感想を編集</button>
    },
  }))

  const prismaImpressionsMock = prismaMock.impression.findMany
  const expectedImpressions = [
    {
      id: 2,
      impression: '興味深い本でした',
      createdAt: new Date('2022-11-01T10:22:33+09:00'),
      updatedAt: new Date('2022-11-01T11:44:55+09:00'),
      user: { id: 2, name: 'user02' },
    },
    {
      id: 1,
      impression: '本の感想です。\n面白かったです。',
      createdAt: new Date('2022-10-30T10:00:00+09:00'),
      updatedAt: new Date('2022-10-30T10:00:00+09:00'),
      user: { id: 1, name: 'user01' },
    },
    {
      id: 3,
      impression: '感想',
      createdAt: new Date('2022-10-20T10:00:00+09:00'),
      updatedAt: new Date('2022-10-21T10:00:00+09:00'),
      user: { id: 3, name: 'user03' },
    },
  ]

  it('本の感想を作成日の新しい順に、作成日時(更新されていらたら更新日時も)、投稿者、感想を表示する', async () => {
    // @ts-ignore
    prismaImpressionsMock.mockResolvedValue(expectedImpressions)

    render(await ImpressionList({ bookId: lendableBook.id, userId: user1.id }))

    expect(screen.getByTestId(`postedDate-${0}`).textContent).toBe(
      '2022/11/01 10:22:33 (更新: 2022/11/01 11:44:55)',
    )
    expect(screen.getByTestId(`postedUser-${0}`).textContent).toBe(expectedImpressions[0].user.name)
    expect(screen.getByTestId(`impression-${0}`).textContent).toBe('興味深い本でした')
    expect(screen.getByTestId(`postedDate-${1}`).textContent).toBe('2022/10/30 10:00:00')
    expect(screen.getByTestId(`postedUser-${1}`).textContent).toBe(expectedImpressions[1].user.name)
    expect(screen.getByTestId(`impression-${1}`).textContent).toBe(
      '本の感想です。\n面白かったです。',
    )
    expect(screen.getByTestId(`postedDate-${2}`).textContent).toBe(
      '2022/10/20 10:00:00 (更新: 2022/10/21 10:00:00)',
    )
    expect(screen.getByTestId(`postedUser-${2}`).textContent).toBe(expectedImpressions[2].user.name)
    expect(screen.getByTestId(`impression-${2}`).textContent).toBe('感想')
    expect(prismaImpressionsMock.mock.calls[0][0]?.orderBy).toStrictEqual([{ createdAt: 'desc' }])
  })

  it('感想は、改行を反映して表示する', async () => {
    // @ts-ignore
    prismaImpressionsMock.mockResolvedValue(expectedImpressions)

    render(await ImpressionList({ bookId: lendableBook.id, userId: user1.id }))

    expect(screen.getByTestId(`impression-${0}`)).toHaveClass('whitespace-pre-wrap')
    expect(screen.getByTestId(`impression-${1}`)).toHaveClass('whitespace-pre-wrap')
    expect(screen.getByTestId(`impression-${2}`)).toHaveClass('whitespace-pre-wrap')
  })

  it('自分の感想の場合、感想を編集ボタンが表示される', async () => {
    // @ts-ignore
    prismaImpressionsMock.mockResolvedValue(expectedImpressions)

    render(await ImpressionList({ bookId: lendableBook.id, userId: user1.id }))

    expect(within(screen.getByTestId(`edit-${0}`)).queryByRole('button')).not.toBeInTheDocument()
    expect(within(screen.getByTestId(`edit-${1}`)).getByRole('button')).toBeInTheDocument()
    expect(within(screen.getByTestId(`edit-${2}`)).queryByRole('button')).not.toBeInTheDocument()
  })

  it('感想が登録されていない場合、その旨のメッセージを表示する', async () => {
    // @ts-ignore
    prismaImpressionsMock.mockResolvedValue([])

    render(await ImpressionList({ bookId: lendableBook.id, userId: user1.id }))

    expect(screen.getByText('現在登録されている感想はありません')).toBeInTheDocument()
  })

  it('返却履歴の取得時にエラーが発生した場合、エラーメッセージが表示される', async () => {
    const expectedError = new Error('DBエラー')
    prismaImpressionsMock.mockRejectedValue(expectedError)
    console.error = vi.fn()

    render(await ImpressionList({ bookId: lendableBook.id, userId: user1.id }))

    expect(
      screen.getByText('感想の取得に失敗しました。再読み込みしてみてください。'),
    ).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectedError)
  })

  it('UserAvatarがlinkToProfile=trueで呼び出される', async () => {
    // @ts-ignore
    prismaImpressionsMock.mockResolvedValue(expectedImpressions)

    render(await ImpressionList({ bookId: lendableBook.id, userId: user1.id }))

    expect(UserAvatarMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expectedImpressions[0].user,
        linkToProfile: true,
      }),
      undefined,
    )
    expect(UserAvatarMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expectedImpressions[1].user,
        linkToProfile: true,
      }),
      undefined,
    )
    expect(UserAvatarMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expectedImpressions[2].user,
        linkToProfile: true,
      }),
      undefined,
    )
  })
})
