import type { Session } from 'next-auth'

/**
 * RegisterPageのロジック
 * セッションからuserIdを取得する
 */
export const getRegisterPageData = (session: Session | null): { userId: number } | Error => {
  if (!session) {
    return new Error('セッションが取得できませんでした')
  }
  return { userId: session.customUser.id }
}
