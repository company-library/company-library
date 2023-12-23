/**
 * server側で実行されるコードのため、テスト環境をnodeに変更する
 * https://stackoverflow.com/questions/76379428/how-to-test-nextjs-app-router-api-route-with-jest
 * @jest-environment node
 */

import { user1 } from '../../../__utils__/data/user'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'
import { lendBook, returnBook } from '@/app/books/[id]/actions'

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

  describe('returnBook function', () => {
    const bookId = 111
    const userId = user1.id
    const lendingHistoryId = 222
    const impression = '感想'
    const args = {
      bookId: bookId,
      userId: userId,
      lendingHistoryId: lendingHistoryId,
      impression: impression,
    }

    it('返却処理として、該当の貸出履歴に返却履歴を追加する', async () => {
      prismaMock.$transaction.mockImplementationOnce((callback) => callback(prismaMock))
      prismaMock.returnHistory.create.mockResolvedValueOnce({
        lendingHistoryId: lendingHistoryId,
        returnedAt: new Date(),
      })

      const result = await returnBook(args)

      expect(result).toBeUndefined()
      expect(prismaMock.returnHistory.create).toHaveBeenCalledWith({
        data: {
          lendingHistoryId,
        },
      })
    })

    it('感想が書かれている場合、返却処理として、該当の貸出履歴に返却履歴を追加し、感想の登録を行う', async () => {
      prismaMock.$transaction.mockImplementationOnce((callback) => callback(prismaMock))
      prismaMock.returnHistory.create.mockResolvedValueOnce({
        lendingHistoryId: lendingHistoryId,
        returnedAt: new Date(),
      })
      prismaMock.impression.create.mockResolvedValueOnce({
        id: 1,
        bookId: bookId,
        userId: 2,
        impression: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await returnBook(args)

      expect(result).toBeUndefined()
      expect(prismaMock.$transaction).toHaveBeenCalled()
      expect(prismaMock.returnHistory.create).toHaveBeenCalledWith({
        data: {
          lendingHistoryId,
        },
      })
      expect(prismaMock.impression.create).toHaveBeenCalledWith({
        data: {
          bookId,
          userId,
          impression,
        },
      })
    })

    describe('返却処理に失敗した場合はエラーを返す', () => {
      it('返却履歴の追加に失敗した場合', async () => {
        prismaMock.$transaction.mockImplementationOnce((callback) => callback(prismaMock))
        const errorMock = jest.spyOn(console, 'error').mockImplementationOnce(() => {})
        const error = 'DB error has occurred'
        prismaMock.returnHistory.create.mockRejectedValueOnce(error)

        const result = (await returnBook(args)) as Error

        expect(result.message).toBe('返却に失敗しました。もう一度試して見てください。')
        expect(prismaMock.returnHistory.create).toHaveBeenCalledWith({
          data: {
            lendingHistoryId,
          },
        })
        expect(errorMock).toHaveBeenCalledWith(error)
      })

      it('感想の登録に失敗した場合', async () => {
        prismaMock.$transaction.mockImplementationOnce((callback) => callback(prismaMock))
        const errorMock = jest.spyOn(console, 'error').mockImplementationOnce(() => {})
        const error = 'DB error has occurred'
        prismaMock.returnHistory.create.mockResolvedValueOnce({
          lendingHistoryId: lendingHistoryId,
          returnedAt: new Date(),
        })
        prismaMock.impression.create.mockRejectedValueOnce(error)

        const result = (await returnBook(args)) as Error

        expect(result.message).toBe('返却に失敗しました。もう一度試して見てください。')
        expect(prismaMock.returnHistory.create).toHaveBeenCalledWith({
          data: {
            lendingHistoryId,
          },
        })
        expect(errorMock).toHaveBeenCalledWith(error)
      })
    })
  })
})
