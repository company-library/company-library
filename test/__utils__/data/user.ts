import { OldUserSummary, UserSummary } from '@/models/user'
import {
  lendingHistory1,
  lendingHistory2,
  lendingHistory3,
  lendingHistory4,
  lendingHistory5,
  lendingHistory6,
} from './lendingHistory'

export const user1: UserSummary = {
  id: 1,
  name: 'テスト太郎',
  email: 'test1@example.com',
  imageUrl: 'https://example.com/image/1',
  createdAt: new Date(),
  lendingHistories: [
    { ...lendingHistory1, returnHistory: null },
    { ...lendingHistory2, returnHistory: null },
    { ...lendingHistory3, returnHistory: null },
    {
      ...lendingHistory3,
      returnHistory: {
        lendingHistoryId: lendingHistory3.id,
        returnedAt: new Date('2021-02-03'),
      },
    },
    {
      ...lendingHistory4,
      returnHistory: {
        lendingHistoryId: lendingHistory4.id,
        returnedAt: new Date('2021-02-04'),
      },
    },
    {
      ...lendingHistory4,
      returnHistory: {
        lendingHistoryId: lendingHistory4.id,
        returnedAt: new Date('2021-04-04'),
      },
    },
    {
      ...lendingHistory5,
      returnHistory: {
        lendingHistoryId: lendingHistory5.id,
        returnedAt: new Date('2021-02-05'),
      },
    },
    {
      ...lendingHistory6,
      returnHistory: {
        lendingHistoryId: lendingHistory6.id,
        returnedAt: new Date('2021-02-06'),
      },
    },
  ],
}

export const user2: UserSummary = {
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
