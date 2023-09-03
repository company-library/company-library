import { Book } from '@/models/book'
import { LendingHistory } from '@/models/lendingHistory'
import { ReturnHistory } from '@/models/returnHistory'

type LH = LendingHistory & {
  book: Book
  returnHistory: ReturnHistory | null
}

export const readingHistories = (lendingHistories: LH[]) => {
  const uniqueLendingHistories = lendingHistories
    .map((h) => {
      return {
        book: h.book,
        isReturned: !!h.returnHistory,
      }
    })
    .reduce<Array<{ book: Book; isReturned: boolean }>>((acc, obj) => {
      return acc.some((a) => a.book.id === obj.book.id && a.isReturned === obj.isReturned)
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
