import { render, screen } from '@testing-library/react'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'
import { lendableBook } from '../../../__utils__/data/book'
import { DateTime, Settings } from 'luxon'

describe('LendingList Component', () => {
  const UserAvatarMock = jest.fn().mockImplementation(({ user }) => <div>{user.name}</div>)
  jest.mock('@/components/userAvatar', () => ({
    __esModule: true,
    default: (...args: any) => UserAvatarMock(...args),
  }))

  const LendingListComponent = require('@/app/books/[id]/lendingList').default

  const expectedLendingHistories = [
    {
      id: 2,
      dueDate: new Date('2022-10-30'),
      lentAt: new Date('2022-10-01'),
      user: { id: 2, name: 'user02' },
    },
    {
      id: 3,
      dueDate: new Date('2022-10-31'),
      lentAt: new Date('2022-10-01'),
      user: { id: 3, name: 'user03' },
    },
    {
      id: 1,
      dueDate: new Date('2022-11-01'),
      lentAt: new Date('2022-10-01'),
      user: { id: 1, name: 'user01' },
    },
  ]

  const prismaLendingHistoryMock = prismaMock.lendingHistory.findMany

  it('貸出中のユーザーがいる場合、その一覧が返却予定日の昇順で表示される', async () => {
    // @ts-ignore
    prismaLendingHistoryMock.mockResolvedValueOnce(expectedLendingHistories)

    render(await LendingListComponent({ bookId: lendableBook.id }))

    expect(prismaLendingHistoryMock.mock.calls[0][0]?.orderBy).toStrictEqual([{ lentAt: 'asc' }])
    expect(screen.getByTestId(`dueDate-${0}`).textContent).toBe('2022/10/30')
    expect(screen.getByTestId(`lendingUser-${0}`).textContent).toBe(
      expectedLendingHistories[0].user.name,
    )
    expect(screen.getByTestId(`dueDate-${1}`).textContent).toBe('2022/10/31')
    expect(screen.getByTestId(`lendingUser-${1}`).textContent).toBe(
      expectedLendingHistories[1].user.name,
    )
    expect(screen.getByTestId(`dueDate-${2}`).textContent).toBe('2022/11/01')
    expect(screen.getByTestId(`lendingUser-${2}`).textContent).toBe(
      expectedLendingHistories[2].user.name,
    )
  })

  it('返却予定日は、表示した日を過ぎていた場合、赤太字になる', async () => {
    const expectedNow = DateTime.local(2022, 10, 31, 10, 0, 0)
    Settings.now = () => expectedNow.toMillis()
    // @ts-ignore
    prismaLendingHistoryMock.mockResolvedValueOnce(expectedLendingHistories)

    render(await LendingListComponent({ bookId: lendableBook.id }))

    expect(screen.getByTestId(`dueDate-${0}`).textContent).toBe('2022/10/30')
    expect(screen.getByTestId(`dueDate-${0}`)).toHaveClass('text-red-400', 'font-bold')
    expect(screen.getByTestId(`dueDate-${1}`).textContent).toBe('2022/10/31')
    expect(screen.getByTestId(`dueDate-${1}`)).not.toHaveClass('text-red-400')
    expect(screen.getByTestId(`dueDate-${1}`)).not.toHaveClass('font-bold')
    expect(screen.getByTestId(`dueDate-${2}`).textContent).toBe('2022/11/01')
    expect(screen.getByTestId(`dueDate-${2}`)).not.toHaveClass('text-red-400')
    expect(screen.getByTestId(`dueDate-${2}`)).not.toHaveClass('font-bold')
  })

  it('貸出中のユーザーがいない場合、その旨のメッセージが表示される', async () => {
    // @ts-ignore
    prismaLendingHistoryMock.mockResolvedValueOnce([])

    render(await LendingListComponent({ bookId: lendableBook.id }))

    expect(screen.getByText('現在借りているユーザーはいません')).toBeInTheDocument()
  })

  it('返却履歴の取得時にエラーが発生した場合、エラーメッセージが表示される', async () => {
    const expectedError = new Error('DBエラー')
    prismaLendingHistoryMock.mockRejectedValueOnce(expectedError)
    console.error = jest.fn()

    render(await LendingListComponent({ bookId: lendableBook.id }))

    expect(
      screen.getByText('貸出履歴の取得に失敗しました。再読み込みしてみてください。'),
    ).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectedError)
  })
})
