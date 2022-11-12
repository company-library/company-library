export type User = {
  id: number
  name: string
  email: string
  sub: string
}

export const isCustomUser = (value: any): value is User => {
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
  imageUrl?: string | null
  lendingHistories: Array<{ returnHistories_aggregate: { aggregate?: { count: number } | null } }>
}
