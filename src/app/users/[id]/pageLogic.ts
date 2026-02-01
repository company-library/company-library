import { readingHistories } from '@/hooks/server/readingHistories'
import prisma from '@/libs/prisma/client'
import type { UserSummary } from '@/models/user'

/**
 * UserPageのロジック
 * paramsからidを取得し、ユーザー情報を取得する
 */
export const getUserPageData = async (
  params: { id: string },
): Promise<
  | {
      user: UserSummary
      readingBooksCount: number
      haveReadBooksCount: number
      readingBooks: { bookId: number; dueDate: Date }[]
      haveReadBooks: { bookId: number }[]
    }
  | Error
> => {
  const id = Number(params.id)
  if (Number.isNaN(id)) {
    return new Error('不正なユーザーです')
  }

  const user = await prisma.user
    .findUnique({
      where: { id },
      include: { lendingHistories: { include: { returnHistory: true } } },
    })
    .catch((e) => {
      console.error(e)
      return new Error('User fetch failed')
    })

  if (user instanceof Error || !user) {
    return new Error('ユーザーの取得に失敗しました')
  }

  const { readingBooks, haveReadBooks } = readingHistories(user.lendingHistories)
  return {
    user,
    readingBooksCount: readingBooks.length,
    haveReadBooksCount: haveReadBooks.length,
    readingBooks,
    haveReadBooks,
  }
}
