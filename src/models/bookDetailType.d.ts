export type BookDetailType = {
  id: number
  title: string
  isbn: string
  imageUrl?: string | null
  registrationHistories: Array<{
    userId: number
    createdAt: any
  }>
  lendingHistories: Array<{
    id: number
    createdAt: any
    dueDate: any
    user: {
      id: number
      name: string
      imageUrl?: string | null
    }
    returnHistories: Array<{
      createdAt: any
    }>
  }>
  reservations: Array<{
    userId: number
    reservationDate: any
    createdAt: any
  }>
}
