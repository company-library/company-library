import type { LendingHistory } from '@/models/lendingHistory'
import { book1, book2, book3, book4, book5, book6 } from './book'
import { location1 } from './location'

export const lendingHistory1: LendingHistory = {
  id: 1,
  bookId: book1.id,
  userId: 1, // user1.id
  locationId: location1.id,
  lentAt: new Date('2020-01-01'),
  dueDate: new Date('2020-02-01'),
}

export const lendingHistory2: LendingHistory = {
  id: 2,
  bookId: book2.id,
  userId: 1, // user1.id
  locationId: location1.id,
  lentAt: new Date('2020-01-01'),
  dueDate: new Date('2020-02-02'),
}

export const lendingHistory3: LendingHistory = {
  id: 3,
  bookId: book3.id,
  userId: 1, // user1.id
  locationId: location1.id,
  lentAt: new Date('2020-01-01'),
  dueDate: new Date('2020-02-01'),
}

export const lendingHistory4: LendingHistory = {
  id: 4,
  bookId: book4.id,
  userId: 1, // user1.id
  locationId: location1.id,
  lentAt: new Date('2020-01-01'),
  dueDate: new Date('2020-02-01'),
}

export const lendingHistory5: LendingHistory = {
  id: 5,
  bookId: book5.id,
  userId: 1, // user1.id
  locationId: location1.id,
  lentAt: new Date('2020-01-01'),
  dueDate: new Date('2020-02-01'),
}

export const lendingHistory6: LendingHistory = {
  id: 6,
  bookId: book6.id,
  userId: 1, // user1.id
  locationId: location1.id,
  lentAt: new Date('2020-01-01'),
  dueDate: new Date('2020-02-01'),
}
