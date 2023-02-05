import { useAvailableLent } from '@/hooks/useAvailableLent'
import { lendableBook } from '../__utils__/data/book'
import { renderHook } from '@testing-library/react'
import { user1, user2 } from '../__utils__/data/user'
import { DateTime } from 'luxon'

describe('useAvailableLent hook', () => {
  const loggedInUser = user1
  const otherUser = user2
  const useCustomUserMock = jest
    .spyOn(require('@/hooks/useCustomUser'), 'useCustomUser')
    .mockReturnValue({ user: loggedInUser })

  const today = DateTime.local().setZone('Asia/Tokyo')
  const bookBase = lendableBook
  const returnedLoggedInUserLendingHistory = {
    id: 1,
    createdAt: today.minus({ days: 4 }).toISO(),
    dueDate: new Date(),
    user: loggedInUser,
    returnHistories: [{ createdAt: today.minus({ days: 2 }).toISO() }],
  }
  const notReturnedOtherUserLendingHistory = {
    id: 2,
    createdAt: today.minus({ days: 3 }).toISO(),
    dueDate: new Date(),
    user: otherUser,
    returnHistories: [],
  }
  const notReturnedLoggedInUserLendingHistory = {
    id: 3,
    createdAt: today.minus({ days: 2 }).toISO(),
    dueDate: new Date(),
    user: loggedInUser,
    returnHistories: [],
  }
  const returnedOtherUserLendingHistory = {
    id: 4,
    createdAt: today.minus({ days: 1 }).toISO(),
    dueDate: new Date(),
    user: otherUser,
    returnHistories: [{ createdAt: today.minus({ days: 4 }).toISO() }],
  }

  it('所蔵数は、 その本の登録履歴のレコード数 であること', () => {
    const book = { ...bookBase }

    const { result } = renderHook(() => useAvailableLent(book))

    expect(result.current.holdings).toBe(book.registrationHistories.length)
  })

  it('予約数は、 その本の予約履歴のレコード数 であること', () => {
    const book = { ...bookBase }

    const { result } = renderHook(() => useAvailableLent(book))

    expect(result.current.reservations).toBe(book.reservations.length)
  })

  it('貸出可能数は、 所蔵数 - 未返却の貸出履歴数 - 予約数 であること', () => {
    const book = { ...bookBase }

    const { result } = renderHook(() => useAvailableLent(book))

    expect(result.current.lendables).toBe(
      book.registrationHistories.length -
        book.lendingHistories.filter((h) => h.returnHistories.length === 0).length -
        book.reservations.length,
    )
  })

  it('ログインユーザーの貸出履歴がない場合、借用中ではないこと', () => {
    const book = { ...bookBase }

    const { result } = renderHook(() => useAvailableLent(book))

    expect(result.current.isLending).toBe(false)
  })
  it('ログインユーザーの貸出履歴があり、それら全て返却履歴がある場合、借用中ではないこと', () => {
    const returnedBook = {
      ...bookBase,
      lendingHistories: [returnedLoggedInUserLendingHistory],
    }

    const { result } = renderHook(() => useAvailableLent(returnedBook))

    expect(result.current.isLending).toBe(false)
  })
  it('ログインユーザーの貸出履歴があり、返却履歴のないものが1件でもある場合、借用中であること', () => {
    const notReturnedBook = {
      ...bookBase,
      lendingHistories: [notReturnedLoggedInUserLendingHistory],
    }

    const { result } = renderHook(() => useAvailableLent(notReturnedBook))

    expect(result.current.isLending).toBe(true)
  })

  it('借用中ではない かつ 貸出可能数が0より大きい 場合、貸出可能であること', () => {
    const book = { ...bookBase }

    const { result } = renderHook(() => useAvailableLent(book))
    // 前提条件の確認
    expect(result.current.isLending).toBe(false)
    expect(result.current.lendables).toBeGreaterThan(0)

    expect(result.current.isLendable).toBe(true)
  })

  it('返却履歴のないログインユーザーの貸出履歴がない場合、undefinedを返す', () => {
    const returnedBook = {
      ...bookBase,
      lendingHistories: [returnedLoggedInUserLendingHistory, notReturnedOtherUserLendingHistory],
    }

    const { result } = renderHook(() => useAvailableLent(returnedBook))

    expect(result.current.lendingHistory).toBeUndefined()
  })
  it('返却履歴のないログインユーザーの貸出履歴がある場合、それを返す', () => {
    const notReturnedBook = {
      ...bookBase,
      lendingHistories: [notReturnedLoggedInUserLendingHistory],
    }

    const { result } = renderHook(() => useAvailableLent(notReturnedBook))

    expect(result.current.lendingHistory).toBe(notReturnedLoggedInUserLendingHistory)
  })

  it('返却履歴のない貸出履歴の一覧を、返却予定日の昇順で返す', () => {
    const book = {
      ...bookBase,
      lendingHistories: [
        returnedLoggedInUserLendingHistory,
        notReturnedLoggedInUserLendingHistory,
        notReturnedOtherUserLendingHistory,
      ],
    }

    const { result } = renderHook(() => useAvailableLent(book))

    expect(result.current.lendingHistories).toStrictEqual([
      notReturnedOtherUserLendingHistory,
      notReturnedLoggedInUserLendingHistory,
    ])
  })

  it('返却履歴のある貸出履歴の一覧を、返却日の降順で返す', () => {
    const book = {
      ...bookBase,
      lendingHistories: [
        returnedOtherUserLendingHistory,
        returnedLoggedInUserLendingHistory,
        notReturnedLoggedInUserLendingHistory,
        notReturnedOtherUserLendingHistory,
      ],
    }

    const { result } = renderHook(() => useAvailableLent(book))

    expect(result.current.lentHistories).toStrictEqual([
      returnedLoggedInUserLendingHistory,
      returnedOtherUserLendingHistory,
    ])
  })

  it('ログインユーザーが取得できなかった場合、返却履歴のログインユーザーの貸出履歴はundefinedで、貸出中かはfalseを返す', () => {
    useCustomUserMock.mockReturnValueOnce({ user: undefined })
    const book = { ...bookBase }

    const { result } = renderHook(() => useAvailableLent(book))

    expect(result.current.isLending).toBe(false)
    expect(result.current.lendingHistory).toBeUndefined()
  })
})
