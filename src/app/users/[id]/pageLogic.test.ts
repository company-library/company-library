import { getUserPageData } from '@/app/users/[id]/pageLogic'
import { user1 } from '../../../../test/__utils__/data/user'
import { prismaMock } from '../../../../test/__utils__/libs/prisma/singleton'

describe('getUserPageData', () => {
  it('正常なパラメータの場合、ユーザー情報と読書履歴を返す', async () => {
    const params = { id: '1' }
    prismaMock.user.findUnique.mockResolvedValue(user1)

    const result = await getUserPageData(params)

    expect(result).not.toBeInstanceOf(Error)
    if (!(result instanceof Error)) {
      expect(result.user).toEqual(user1)
      expect(result.readingBooksCount).toBe(3)
      expect(result.haveReadBooksCount).toBe(4)
      expect(result.readingBooks.length).toBe(3)
      expect(result.haveReadBooks.length).toBe(4)
    }
  })

  it('パラメータのidが数値でない場合、Errorを返す', async () => {
    const params = { id: 'abc' }

    const result = await getUserPageData(params)

    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toBe('不正なユーザーです')
  })

  it('ユーザーが見つからない場合、Errorを返す', async () => {
    const params = { id: '1' }
    prismaMock.user.findUnique.mockResolvedValue(null)

    const result = await getUserPageData(params)

    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toBe('ユーザーの取得に失敗しました')
  })

  it('データベースエラーの場合、Errorを返す', async () => {
    const params = { id: '1' }
    const errorMock = vi.spyOn(console, 'error').mockImplementation(() => {})
    prismaMock.user.findUnique.mockRejectedValue(new Error('DB error'))

    const result = await getUserPageData(params)

    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toBe('ユーザーの取得に失敗しました')
    expect(errorMock).toHaveBeenCalled()
  })
})
