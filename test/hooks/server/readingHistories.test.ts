import { readingHistories } from '@/hooks/server/readingHistories'
import { book1, book2, book3 } from '../../__utils__/data/book'
import {
  lendingHistory1,
  lendingHistory2,
  lendingHistory3,
} from '../../__utils__/data/lendingHistory'

describe('readingHistories hook', () => {
  it('貸出履歴から、読書中の本と読了済みの本を取得できる', () => {
    const lendingHistories = [
      {
        ...lendingHistory1,
        returnHistory: null,
      },
      {
        ...lendingHistory2,
        returnHistory: {
          lendingHistoryId: lendingHistory2.id,
          returnedAt: new Date('2020-01-02'),
        },
      },
      {
        ...lendingHistory3,
        returnHistory: {
          lendingHistoryId: lendingHistory3.id,
          returnedAt: new Date('2020-01-03'),
        },
      },
    ]

    const result = readingHistories(lendingHistories)

    expect(result.readingBooks).toHaveLength(1)
    expect(result.readingBooks[0].bookId).toBe(book1.id)
    expect(result.haveReadBooks).toHaveLength(2)
    expect(result.haveReadBooks[0].bookId).toBe(book2.id)
    expect(result.haveReadBooks[1].bookId).toBe(book3.id)
  })
})
