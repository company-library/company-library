import { editImpression, lendBook, returnBook } from '@/app/books/[id]/actions'
import { user1 } from '../../../__utils__/data/user'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'

describe('server actions', () => {
  const { redirectMock } = vi.hoisted(() => {
    return { redirectMock: vi.fn() }
  })
  vi.mock('next/navigation', () => ({
    redirect: () => redirectMock(),
  }))

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
    })

    it('貸し出し履歴の追加に失敗した場合はエラーを返す', async () => {
      const bookId = 1
      const userId = user1.id
      const dueDate = new Date()
      const error = 'DB error has occurred'
      prismaMock.lendingHistory.create.mockRejectedValueOnce(error)
      const errorMock = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await lendBook(bookId, userId, dueDate)

      expect(result).toBeInstanceOf(Error)
      expect((result as Error).message).toBe('貸し出しに失敗しました。もう一度試して見てください。')
      expect(prismaMock.lendingHistory.create).toBeCalledWith({
        data: {
          bookId,
          userId,
          dueDate,
        },
      })
      expect(errorMock).toBeCalledWith(error)
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
        const errorMock = vi.spyOn(console, 'error').mockImplementationOnce(() => {})
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
        const errorMock = vi.spyOn(console, 'error').mockImplementationOnce(() => {})
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

  describe('editImpression function', () => {
    const { getServerSessionMock } = vi.hoisted(() => {
      return { getServerSessionMock: vi.fn() }
    })
    vi.mock('next-auth', () => ({
      getServerSession: () => getServerSessionMock(),
    }))
    getServerSessionMock.mockResolvedValue({ customUser: { id: user1.id } })

    const mockConsoleError = vi.spyOn(console, 'error')

    it('自身が投稿した感想の編集ができる', async () => {
      prismaMock.$transaction.mockImplementationOnce((callback) => callback(prismaMock))
      prismaMock.impression.updateMany.mockResolvedValueOnce({
        count: 1,
      })

      const result = await editImpression({ impressionId: 72, editedImpression: '編集した感想' })

      expect(result).toBeUndefined()
      expect(prismaMock.impression.updateMany).toHaveBeenCalledWith({
        where: {
          id: 72,
          userId: user1.id,
        },
        data: {
          impression: '編集した感想',
        },
      })
    })

    it('セッションが取得できなかった場合はエラーを返す', async () => {
      mockConsoleError.mockImplementationOnce(() => {})
      getServerSessionMock.mockResolvedValueOnce(null)

      const result = await editImpression({ impressionId: 1, editedImpression: 'セッションなし' })

      expect(result).toBeInstanceOf(Error)
      expect((result as Error).message).toBe(
        '感想の編集に失敗しました。もう一度試して見てください。',
      )
      expect(mockConsoleError).toHaveBeenCalledWith('セッションが取得できませんでした')
    })

    it('他のユーザーの感想を更新しようとした場合はエラーを返す', async () => {
      mockConsoleError.mockImplementationOnce(() => {})
      prismaMock.$transaction.mockImplementationOnce((callback) => callback(prismaMock))
      prismaMock.impression.updateMany.mockResolvedValueOnce({
        count: 0,
      })

      const result = await editImpression({ impressionId: 1, editedImpression: '他人の感想' })

      expect(result).toBeInstanceOf(Error)
      expect((result as Error).message).toBe(
        '感想の編集に失敗しました。もう一度試して見てください。',
      )
      expect(mockConsoleError).toHaveBeenCalledWith(
        new Error('自分の感想以外を編集しようとしています', { cause: { count: 0 } }),
      )
    })
  })
})
