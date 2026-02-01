import type { Session } from 'next-auth'

/**
 * BookDetailPageのロジック
 * paramsからbookIdを取得し、セッションからuserIdを取得する
 */
export const getBookDetailPageData = (
  params: { id: string },
  session: Session | null,
): { bookId: number; userId: number } | Error => {
  const bookId = Number(params.id)
  if (Number.isNaN(bookId)) {
    return new Error('不正な書籍です')
  }

  if (!session) {
    return new Error('セッションが取得できませんでした')
  }

  return { bookId, userId: session.customUser.id }
}
