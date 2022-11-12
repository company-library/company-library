import { UserSummary } from '@/models/user'

export const user1: UserSummary = {
  id: 1,
  name: 'テスト太郎',
  email: 'test@example.com',
  imageUrl: 'https://example.com/image/1',
  lendingHistories: [
    { returnHistories_aggregate: { aggregate: { count: 1 } } },
    { returnHistories_aggregate: { aggregate: { count: 1 } } },
    { returnHistories_aggregate: { aggregate: { count: 0 } } },
  ],
}

export const user2: UserSummary = {
  id: 1,
  name: 'テスト太郎',
  email: 'test@example.com',
  lendingHistories: [],
}
