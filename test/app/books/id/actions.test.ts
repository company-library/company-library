/**
 * server側で実行されるコードのため、テスト環境をnodeに変更する
 * https://stackoverflow.com/questions/76379428/how-to-test-nextjs-app-router-api-route-with-jest
 * @jest-environment node
 */

import { user1 } from '../../../__utils__/data/user'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'
import { lendBook } from '@/app/books/[id]/actions'

const redirectMock = jest.fn()
jest.mock('next/navigation', () => ({
  __esModule: true,
  redirect: () => redirectMock(),
}))

describe('server actions', () => {
  describe('lendBook function', () => {
    it('貸し出し履歴の追加ができる', async () => {
      const bookId = 1
      const userId = user1.id
      const dueDate = new Date()
      prismaMock.lendingHistory.create.mockResolvedValueOnce({
        id: 1,
        bookId: bookId,
        userId: userId,
        dueDate: dueDate,
        lentAt: new Date(),
      })

      const result = await lendBook(bookId, userId, dueDate)

      expect(result).toBeUndefined()
      expect(prismaMock.lendingHistory.create).toBeCalledWith({
        data: {
          bookId,
          userId,
          dueDate,
        },
      })
      expect(redirectMock).toBeCalled()
    })

    it('貸し出し履歴の追加に失敗した場合はエラーを返す', async () => {
      const bookId = 1
      const userId = user1.id
      const dueDate = new Date()
      const error = 'DB error has occurred'
      prismaMock.lendingHistory.create.mockRejectedValueOnce(error)
      const errorMock = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = await lendBook(bookId, userId, dueDate)

      expect(result.message).toBe('貸し出しに失敗しました。もう一度試して見てください。')
      expect(prismaMock.lendingHistory.create).toBeCalledWith({
        data: {
          bookId,
          userId,
          dueDate,
        },
      })
      expect(errorMock).toBeCalledWith(error)
      expect(redirectMock).not.toBeCalled()
    })
  })
})
