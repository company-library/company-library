import { readingHistories } from '@/hooks/server/readingHistories'
import prisma from '@/libs/prisma/client'
import type { UserSummary } from '@/models/user'

type UserWithCounts = {
  user: UserSummary
  readingBookCount: number
  haveReadBookCount: number
}

/**
 * UsersPageのロジック
 * ユーザー一覧と読書履歴を取得する
 */
export const getUsersPageData = async (): Promise<UserWithCounts[] | Error> => {
  const users = await prisma.user
    .findMany({ include: { lendingHistories: { include: { returnHistory: true } } } })
    .catch((e) => {
      console.error(e)
      return new Error('User fetch failed')
    })

  if (users instanceof Error) {
    return new Error('ユーザー一覧の取得に失敗しました')
  }

  const usersWithCounts = users.map((user) => {
    const { readingBooks, haveReadBooks } = readingHistories(user.lendingHistories)
    return {
      user,
      readingBookCount: readingBooks.length,
      haveReadBookCount: haveReadBooks.length,
    }
  })

  return usersWithCounts
}
