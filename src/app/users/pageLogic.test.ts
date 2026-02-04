import { getUsersPageData } from '@/app/users/pageLogic'
import { user1, user2 } from '../../../test/__utils__/data/user'
import { prismaMock } from '../../../test/__utils__/libs/prisma/singleton'

describe('getUsersPageData', () => {
  it('正常な場合、ユーザー一覧と読書履歴を返す', async () => {
    prismaMock.user.findMany.mockResolvedValue([user1, user2])

    const result = await getUsersPageData()

    expect(result).not.toBeInstanceOf(Error)
    if (!(result instanceof Error)) {
      expect(result.length).toBe(2)
      expect(result[0].user).toEqual(user1)
      expect(result[0].readingBookCount).toBe(3)
      expect(result[0].haveReadBookCount).toBe(4)
      expect(result[1].user).toEqual(user2)
    }
  })

  it('データベースエラーの場合、Errorを返す', async () => {
    const errorMock = vi.spyOn(console, 'error').mockImplementation(() => {})
    prismaMock.user.findMany.mockRejectedValue(new Error('DB error'))

    const result = await getUsersPageData()

    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toBe('ユーザー一覧の取得に失敗しました')
    expect(errorMock).toHaveBeenCalled()
  })
})
