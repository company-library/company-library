import type { LendingHistory } from '@/models/lendingHistory'
import type { ReturnHistory } from '@/models/returnHistory'

type LH = LendingHistory & {
  returnHistory: ReturnHistory | null
}

export const readingHistories = (lendingHistories: LH[]) => {
  const uniqueLendingHistories = lendingHistories
    .map((h) => {
      return {
        bookId: h.bookId,
        dueDate: h.dueDate,
        isReturned: !!h.returnHistory,
      }
    })
    .reduce<Array<{ bookId: number; dueDate: Date; isReturned: boolean }>>((acc, obj) => {
      if (acc.some((a) => a.bookId === obj.bookId && a.isReturned === obj.isReturned)) {
        return acc
      }
      acc.push(obj)
      return acc
    }, [])

  const readingBooks = uniqueLendingHistories.filter((h) => !h.isReturned)

  const haveReadBooks = uniqueLendingHistories.filter((h) => h.isReturned)

  return {
    readingBooks,
    haveReadBooks,
  }
}
