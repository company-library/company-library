import { UserSummary } from '@/models/user'

export const user1: UserSummary = {
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
    { bookId: 6, returnHistories_aggregate: { aggregate: { count: 1 } } }
  ],
}

export const user2: UserSummary = {
  id: 2,
  name: 'テスト二郎',
  email: 'test2@example.com',
  lendingHistories: [],
}
