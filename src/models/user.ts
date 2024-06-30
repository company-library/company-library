import type { LendingHistory } from '@/models/lendingHistory'
import type { ReturnHistory } from '@/models/returnHistory'

export type User = {
  id: number
  name: string
  email: string
}

export const isUser = (value: unknown): value is User => {
  if (typeof value !== 'object' || value == null) {
    return false
  }

  const maybeUser = value as { id: unknown; name: unknown; email: unknown; sub: unknown }
  return (
    typeof maybeUser.id === 'number' &&
    typeof maybeUser.name === 'string' &&
    typeof maybeUser.email === 'string' &&
    typeof maybeUser.sub === 'string'
  )
}

export type UserSummary = {
  id: number
  name: string
  email: string
  imageUrl: string | null
  createdAt: Date
  lendingHistories: Array<
    LendingHistory & {
      returnHistory: ReturnHistory | null
    }
  >
}
