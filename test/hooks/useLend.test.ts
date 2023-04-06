import { useLend } from '@/hooks/useLend'
import { act, renderHook } from '@testing-library/react'
import { DateTime } from 'luxon'
import { user1 } from '../__utils__/data/user'

const useRouterMock = jest.fn().mockReturnValue({ reload: jest.fn() })
jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => useRouterMock(),
}))

const loggedInUser = user1
jest.mock('@/hooks/useCustomUser', () => ({
  __esModule: true,
  useCustomUser: () => ({ user: loggedInUser }),
}))

const expectedMutationResult = {
  data: undefined,
  error: undefined,
  extensions: undefined,
  fetching: false,
  operation: undefined,
  stale: false,
}

const mutationMock = jest.fn().mockImplementation(
  () =>
    new Promise((resolve) =>
      resolve({
        data: {},
        error: undefined,
        extensions: undefined,
        hasNext: false,
        operation: {},
      }),
    ),
)
jest.mock('@/generated/graphql.client', () => ({
  __esModule: true,
  usePostLendingHistoryMutation: () => {
    return [expectedMutationResult, mutationMock]
  },
}))

describe('useLend hook', () => {
  const expectedBookId = 1
  const today = DateTime.local().setZone('Asia/Tokyo')
  const dateFormat = 'yyyy-MM-dd'
  const initialDuDate = today.toFormat(dateFormat)

  it('返却予定日の初期値に、引数で渡した日付がセットされる', () => {
    const { result } = renderHook(() => useLend(expectedBookId, initialDuDate))

    expect(result.current.dueDate).toBe(initialDuDate)
  })

  it('返却予定日の変更イベントで、返却予定日を変更することができる', () => {
    const { result } = renderHook(() => useLend(expectedBookId, initialDuDate))

    const expectedDuDate = today.plus({ days: 7 }).toFormat(dateFormat)
    act(() => {
      result.current.handleDueDate({
        // @ts-expect-error 簡略化のため使用するプロパティのみを渡す
        currentTarget: { value: expectedDuDate },
      })
    })

    expect(result.current.dueDate).toBe(expectedDuDate)
  })

  it('貸出処理は、ユーザーID，本のID，返却予定日を渡して実行する', async () => {
    const { result } = renderHook(() => useLend(expectedBookId, initialDuDate))

    await result.current.lend()

    expect(mutationMock).toBeCalledWith({
      userId: loggedInUser.id,
      bookId: expectedBookId,
      dueDate: initialDuDate,
    })
  })
})
