import { render, screen } from '@testing-library/react'
import ReturnList from '@/app/books/[id]/returnList'
import { lendableBook } from '../../../../test/__utils__/data/book'
import { prismaMock } from '../../../../test/__utils__/libs/prisma/singleton'

describe('ReturnList Component', async () => {
  const { UserAvatarMock } = vi.hoisted(() => {
    return {
      UserAvatarMock: vi
        .fn()
        .mockImplementation(({ user, linkToProfile }) =>
          linkToProfile ? (
            <a href={`/users/${encodeURIComponent(user.email)}`}>{user.name}</a>
          ) : (
            <div>{user.name}</div>
          ),
        ),
    }
  })
  vi.mock('@/components/userAvatar', () => ({
    default: (...args: unknown[]) => UserAvatarMock(...args),
  }))

  const expectedReturnHistories = [
    {
      lendingHistoryId: 2,
      returnedAt: new Date('2022-10-30'),
      lendingHistory: {
        id: 2,
        dueDate: new Date('2022-10-08'),
        lentAt: new Date('2022-10-01'),
        user: { id: 2, name: 'user02', email: 'user02@example.com' },
      },
    },
    {
      lendingHistoryId: 3,
      returnedAt: new Date('2022-10-25'),
      lendingHistory: {
        id: 3,
        dueDate: new Date('2022-10-15'),
        lentAt: new Date('2022-10-01'),
        user: { id: 3, name: 'user03', email: 'user03@example.com' },
      },
    },
    {
      lendingHistoryId: 1,
      returnedAt: new Date('2022-10-20'),
      lendingHistory: {
        id: 1,
        dueDate: new Date('2022-10-24'),
        lentAt: new Date('2022-10-01'),
        user: { id: 1, name: 'user01', email: 'user01@example.com' },
      },
    },
  ]

  const prismaReturnHistoryMock = prismaMock.returnHistory.findMany
  prismaReturnHistoryMock.mockResolvedValue(expectedReturnHistories)

  it('返却済の貸出履歴がある場合、その一覧が返却日の昇順で表示される', async () => {
    render(await ReturnList({ bookId: lendableBook.id }))

    expect(screen.getByTestId(`returnedDate-${0}`).textContent).toBe('2022/10/01〜2022/10/30')
    expect(screen.getByTestId(`returnedUser-${0}`).textContent).toBe(
      expectedReturnHistories[0].lendingHistory.user.name,
    )
    expect(screen.getByTestId(`returnedDate-${1}`).textContent).toBe('2022/10/01〜2022/10/25')
    expect(screen.getByTestId(`returnedUser-${1}`).textContent).toBe(
      expectedReturnHistories[1].lendingHistory.user.name,
    )
    expect(screen.getByTestId(`returnedDate-${2}`).textContent).toBe('2022/10/01〜2022/10/20')
    expect(screen.getByTestId(`returnedUser-${2}`).textContent).toBe(
      expectedReturnHistories[2].lendingHistory.user.name,
    )
    expect(prismaReturnHistoryMock.mock.calls[0][0]?.orderBy).toStrictEqual([{ returnedAt: 'asc' }])
  })

  it('返却履歴が登録されていない場合、その旨のメッセージが表示される', async () => {
    // @ts-ignore
    prismaReturnHistoryMock.mockResolvedValue([])

    render(await ReturnList({ bookId: lendableBook.id }))

    expect(screen.getByText('これまで借りたユーザーはいません')).toBeInTheDocument()
  })

  it('返却履歴の取得時にエラーが発生した場合、エラーメッセージが表示される', async () => {
    const expectedError = new Error('DBエラー')
    prismaReturnHistoryMock.mockRejectedValue(expectedError)
    console.error = vi.fn()

    render(await ReturnList({ bookId: lendableBook.id }))

    expect(
      screen.getByText('返却履歴の取得に失敗しました。再読み込みしてみてください。'),
    ).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectedError)
  })

  it('各ユーザーアバターがリンクになっている', async () => {
    // @ts-ignore
    prismaReturnHistoryMock.mockResolvedValue(expectedReturnHistories)

    render(await ReturnList({ bookId: lendableBook.id }))

    const userLinks = screen.getAllByRole('link')

    expect(userLinks).toHaveLength(3)
    expect(userLinks[0]).toHaveAttribute(
      'href',
      `/users/${encodeURIComponent(expectedReturnHistories[0].lendingHistory.user.email)}`,
    )
    expect(userLinks[1]).toHaveAttribute(
      'href',
      `/users/${encodeURIComponent(expectedReturnHistories[1].lendingHistory.user.email)}`,
    )
    expect(userLinks[2]).toHaveAttribute(
      'href',
      `/users/${encodeURIComponent(expectedReturnHistories[2].lendingHistory.user.email)}`,
    )
  })
})
