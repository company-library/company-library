import { OldUserSummary } from '@/models/user'
import { book1, book2, book3, book4, book5, book6 } from './book'

export const user1 = {
  id: 1,
  name: 'テスト太郎',
  email: 'test1@example.com',
  imageUrl: 'https://example.com/image/1',
  createdAt: new Date(),
  lendingHistories: [
    { bookId: 1, lentAt: new Date('2021-01-01'), returnHistory: null, book: book1 },
    { bookId: 1, lentAt: new Date('2021-02-01'), returnHistory: null, book: book1 },
    { bookId: 2, lentAt: new Date('2021-01-02'), returnHistory: null, book: book2 },
    { bookId: 3, lentAt: new Date('2021-01-03'), returnHistory: null, book: book3 },
    {
      bookId: 3,
      lentAt: new Date('2021-01-03'),
      returnHistory: { returnedAt: new Date('2021-02-03') },
      book: book3,
    },
    {
      bookId: 4,
      lentAt: new Date('2021-01-04'),
      returnHistory: { returnedAt: new Date('2021-02-04') },
      book: book4,
    },
    {
      bookId: 4,
      lentAt: new Date('2021-03-04'),
      returnHistory: { returnedAt: new Date('2021-04-04') },
      book: book4,
    },
    {
      bookId: 5,
      lentAt: new Date('2021-01-05'),
      returnHistory: { returnedAt: new Date('2021-02-05') },
      book: book5,
    },
    {
      bookId: 6,
      lentAt: new Date('2021-01-06'),
      returnHistory: { returnedAt: new Date('2021-02-06') },
      book: book6,
    },
  ],
}

export const user2 = {
  id: 2,
  name: 'テスト二郎',
  email: 'test2@example.com',
  imageUrl: null,
  createdAt: new Date(),
  lendingHistories: [],
}

export const oldUser1: OldUserSummary = {
  id: 1,
  name: 'テスト太郎',
  email: 'test1@example.com',
  imageUrl: 'https://example.com/image/1',
  lendingHistories: [
    { bookId: 1, returnHistories_aggregate: { aggregate: { count: 0 } } },
    { bookId: 1, returnHistories_aggregate: { aggregate: { count: 0 } } },
    { bookId: 2, returnHistories_aggregate: { aggregate: { count: 0 } } },
    { bookId: 3, returnHistories_aggregate: { aggregate: { count: 0 } } },
    { bookId: 3, returnHistories_aggregate: { aggregate: { count: 1 } } },
    { bookId: 4, returnHistories_aggregate: { aggregate: { count: 1 } } },
    { bookId: 4, returnHistories_aggregate: { aggregate: { count: 1 } } },
    { bookId: 5, returnHistories_aggregate: { aggregate: { count: 1 } } },
    { bookId: 6, returnHistories_aggregate: { aggregate: { count: 1 } } },
  ],
}

export const oldUser2: OldUserSummary = {
  id: 2,
  name: 'テスト二郎',
  email: 'test2@example.com',
  lendingHistories: [],
}
