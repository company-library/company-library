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

export type OldUserSummary = {
  id: number
  name: string
  email: string
  imageUrl?: string | null
  lendingHistories: Array<{
    bookId: number
    returnHistories_aggregate: { aggregate?: { count: number } | null }
  }>
}

export type UserSummary = {
  id: number
  name: string
  email: string
  imageUrl?: string | null
  lendingHistories: Array<{
    bookId: number
    lentAt: Date
    returnHistory: {
      returnedAt: Date
    } | null
  }>
}
