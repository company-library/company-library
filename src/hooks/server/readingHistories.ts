import { LendingHistory } from '@/models/lendingHistory'
import { ReturnHistory } from '@/models/returnHistory'

type LH = LendingHistory & {
  returnHistory: ReturnHistory | null
}

export const readingHistories = (lendingHistories: LH[]) => {
  const uniqueLendingHistories = lendingHistories
    .map((h) => {
      return {
        bookId: h.bookId,
        isReturned: !!h.returnHistory,
      }
    })
    .reduce<Array<{ bookId: number; isReturned: boolean }>>((acc, obj) => {
      return acc.some((a) => a.bookId === obj.bookId && a.isReturned === obj.isReturned)
        ? acc
        : [...acc, obj]
    }, [])

  const readingBooks = uniqueLendingHistories.filter((h) => !h.isReturned)

  const haveReadBooks = uniqueLendingHistories.filter((h) => h.isReturned)

  return {
    readingBooks,
    haveReadBooks,
  }
}
