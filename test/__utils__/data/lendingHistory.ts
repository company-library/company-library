import { LendingHistory } from '@/models/lendingHistory'
import { book1, book2, book3 } from './book'
import { user1 } from './user'

export const lendingHistory1: LendingHistory = {
  id: 1,
  bookId: book1.id,
  userId: user1.id,
  lentAt: new Date('2020-01-01'),
  dueDate: new Date('2020-02-01'),
}

export const lendingHistory2: LendingHistory = {
  id: 2,
  bookId: book2.id,
  userId: user1.id,
  lentAt: new Date('2020-01-01'),
  dueDate: new Date('2020-02-01'),
}

export const lendingHistory3: LendingHistory = {
  id: 3,
  bookId: book3.id,
  userId: user1.id,
  lentAt: new Date('2020-01-01'),
  dueDate: new Date('2020-02-01'),
}
