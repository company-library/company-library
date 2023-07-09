import { OldUserSummary } from '@/models/user'

export const user1 = {
  id: 1,
  name: 'テスト太郎',
  email: 'test1@example.com',
  imageUrl: 'https://example.com/image/1',
  createdAt: new Date('2023-01-01'),
}

export const user2 = {
  id: 2,
  name: 'テスト二郎',
  email: 'test2@example.com',
  imageUrl: null,
  createdAt: new Date('2023-01-02'),
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
