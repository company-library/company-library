import { LendingHistory } from '@/models/lendingHistory'
import { ReturnHistory } from '@/models/returnHistory'

export type User = {
  id: number
  name: string
  email: string
}

export const isUser = (value: any): value is User => {
  return (
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    typeof value.sub === 'string'
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
