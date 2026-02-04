import type { Session } from 'next-auth'
import { getBookDetailPageData } from '@/app/books/[id]/pageLogic'

describe('getBookDetailPageData', () => {
  const mockSession: Session = {
    customUser: { id: 1, name: 'テスト太郎', email: 'test@example.com' },
  } as Session

  it('正常なパラメータとセッションの場合、bookIdとuserIdを返す', () => {
    const params = { id: '123' }

    const result = getBookDetailPageData(params, mockSession)

    expect(result).toEqual({ bookId: 123, userId: 1 })
  })

  it('パラメータのidが数値でない場合、Errorを返す', () => {
    const params = { id: 'abc' }

    const result = getBookDetailPageData(params, mockSession)

    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toBe('不正な書籍です')
  })

  it('パラメータのidが"123abc"のような形式の場合、Errorを返す', () => {
    const params = { id: '123abc' }

    const result = getBookDetailPageData(params, mockSession)

    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toBe('不正な書籍です')
  })

  it('セッションがnullの場合、Errorを返す', () => {
    const params = { id: '123' }

    const result = getBookDetailPageData(params, null)

    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toBe('セッションが取得できませんでした')
  })
})
