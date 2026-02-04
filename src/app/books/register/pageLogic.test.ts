import type { Session } from 'next-auth'
import { getRegisterPageData } from '@/app/books/register/pageLogic'

describe('getRegisterPageData', () => {
  it('セッションが取得できた場合、userIdを返す', () => {
    const session: Session = {
      customUser: { id: 1, name: 'テスト太郎', email: 'test@example.com' },
    } as Session

    const result = getRegisterPageData(session)

    expect(result).toEqual({ userId: 1 })
  })

  it('セッションがnullの場合、Errorを返す', () => {
    const result = getRegisterPageData(null)

    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toBe('セッションが取得できませんでした')
  })
})
