export type CustomUser = {
  id: number
  name: string
  email: string
  sub: string
}

export const isCustomUser = (value: any): value is CustomUser => {
  return (
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    typeof value.sub === 'string'
  )
}
