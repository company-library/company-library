import { useCustomUser } from '@/hooks/useCustomUser'
import { BookDetailType } from '@/models/bookDetailType'

export const useAvailableLent = (book: BookDetailType) => {
  const { user } = useCustomUser()
  const userId = user ? user.id : 0

  const holdings = book.registrationHistories.length
  const reservations = book.reservations.length
  const lendHistories = book.lendingHistories.filter((h) => h.returnHistories.length === 0)

  const lendables = holdings - lendHistories.length - reservations

  // 借りているか = 返却履歴のない自分の貸出履歴がある
  const lendingHistory = lendHistories.find((h) => h.user.id === userId)
  const isLending = !!lendingHistory

  const isLendable = !isLending && lendables > 0

  const lendingHistories = book.lendingHistories
    .filter((h) => h.returnHistories.length === 0)
    .sort((h1, h2) => (h1.dueDate > h2.dueDate ? 1 : -1))

  const lentHistories = book.lendingHistories
    .filter((h) => h.returnHistories.length !== 0)
    .sort((h1, h2) => (h1.returnHistories[0].createdAt < h2.returnHistories[0].createdAt ? 1 : -1))

  return {
    holdings,
    reservations,
    lendables,

    lendingHistory,
    lendingHistories,
    lentHistories,

    isLending,
    isLendable,
  }
}
