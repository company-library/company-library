import { readingHistories } from '@/hooks/server/readingHistories'
import { getAvatarUrl } from '@/libs/gravatar/getAvatarUrl'
import prisma from '@/libs/prisma/client'
import type { UserSummary } from '@/models/user'

type UserWithCounts = {
  user: UserSummary
  readingBookCount: number
  haveReadBookCount: number
  avatarUrl: string | undefined
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

  const usersWithCounts = await Promise.all(
    users.map(async (user) => {
      const { readingBooks, haveReadBooks } = readingHistories(user.lendingHistories)
      const avatarUrl = await getAvatarUrl(user.email)
      return {
        user,
        readingBookCount: readingBooks.length,
        haveReadBookCount: haveReadBooks.length,
        avatarUrl,
      }
    }),
  )

  return usersWithCounts
}
