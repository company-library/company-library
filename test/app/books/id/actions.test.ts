import { addImpression, editImpression, lendBook, returnBook } from '@/app/books/[id]/actions'
import { book1 } from '../../../__utils__/data/book'
import { location1 } from '../../../__utils__/data/location'
import { user1 } from '../../../__utils__/data/user'

const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      lendingHistory: {
        create: vi.fn()
      },
      returnHistory: {
        create: vi.fn()
      },
      impression: {
        create: vi.fn(),
        updateMany: vi.fn()
      },
      $transaction: vi.fn()
    }
  }
})

vi.mock('@/libs/prisma/client', () => ({
  default: prismaMock
}))

describe('server actions', () => {
  const { redirectMock } = vi.hoisted(() => {
    return { redirectMock: vi.fn() }
  })
  vi.mock('next/navigation', () => ({
    redirect: () => redirectMock(),
  }))

  const consoleErrorSpy = vi.spyOn(console, 'error')

  const { getServerSessionMock } = vi.hoisted(() => {
    return { getServerSessionMock: vi.fn() }
  })
  vi.mock('next-auth', () => ({
    getServerSession: () => getServerSessionMock(),
  }))
  getServerSessionMock.mockResolvedValue({ customUser: { id: user1.id } })

  describe('lendBook function', () => {
    it('貸し出し履歴の追加ができる', async () => {
      const bookId = 1
      const userId = user1.id
      const locationId = location1.id
      const dueDate = new Date()
      prismaMock.lendingHistory.create.mockResolvedValueOnce({
        id: 1,
        bookId: bookId,
        userId: userId,
        locationId: locationId,
        dueDate: dueDate,
        lentAt: new Date(),
      })

      const result = await lendBook(bookId, userId, dueDate, locationId)

      expect(result).toBeUndefined()
      expect(prismaMock.lendingHistory.create).toBeCalledWith({
        data: {
          bookId,
          userId,
          dueDate,
          locationId,
        },
      })
    })

    it('貸し出し履歴の追加に失敗した場合はエラーを返す', async () => {
      const bookId = 1
      const userId = user1.id
      const locationId = location1.id
      const dueDate = new Date()
      const error = 'DB error has occurred'
      prismaMock.lendingHistory.create.mockRejectedValueOnce(error)
      consoleErrorSpy.mockImplementationOnce(() => {})

      const result = await lendBook(bookId, userId, dueDate, locationId)

      expect(result).toBeInstanceOf(Error)
      expect((result as Error).message).toBe('貸し出しに失敗しました。もう一度試して見てください。')
      expect(prismaMock.lendingHistory.create).toBeCalledWith({
        data: {
          bookId,
          userId,
          dueDate,
          locationId,
        },
      })
      expect(consoleErrorSpy).toBeCalledWith(error)
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
        consoleErrorSpy.mockImplementationOnce(() => {})
        prismaMock.$transaction.mockImplementationOnce((callback) => callback(prismaMock))
        const error = 'DB error has occurred'
        prismaMock.returnHistory.create.mockRejectedValueOnce(error)

        const result = (await returnBook(args)) as Error

        expect(result.message).toBe('返却に失敗しました。もう一度試して見てください。')
        expect(prismaMock.returnHistory.create).toHaveBeenCalledWith({
          data: {
            lendingHistoryId,
          },
        })
        expect(consoleErrorSpy).toHaveBeenCalledWith(error)
      })

      it('感想の登録に失敗した場合', async () => {
        consoleErrorSpy.mockImplementationOnce(() => {})
        prismaMock.$transaction.mockImplementationOnce((callback) => callback(prismaMock))
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
        expect(consoleErrorSpy).toHaveBeenCalledWith(error)
      })
    })
  })

  describe('editImpression function', () => {
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
      consoleErrorSpy.mockImplementationOnce(() => {})
      getServerSessionMock.mockResolvedValueOnce(null)

      const result = await editImpression({ impressionId: 1, editedImpression: 'セッションなし' })

      expect(result).toBeInstanceOf(Error)
      expect((result as Error).message).toBe(
        '感想の編集に失敗しました。もう一度試して見てください。',
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith('セッションが取得できませんでした')
    })

    it('他のユーザーの感想を更新しようとした場合はエラーを返す', async () => {
      consoleErrorSpy.mockImplementationOnce(() => {})
      prismaMock.$transaction.mockImplementationOnce((callback) => callback(prismaMock))
      prismaMock.impression.updateMany.mockResolvedValueOnce({
        count: 0,
      })

      const result = await editImpression({ impressionId: 1, editedImpression: '他人の感想' })

      expect(result).toBeInstanceOf(Error)
      expect((result as Error).message).toBe(
        '感想の編集に失敗しました。もう一度試して見てください。',
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        new Error('自分の感想以外を編集しようとしています', { cause: { count: 0 } }),
      )
    })
  })

  describe('addImpression function', () => {
    const { revalidatePathMock } = vi.hoisted(() => {
      return { revalidatePathMock: vi.fn() }
    })
    vi.mock('next/cache', () => ({
      revalidatePath: revalidatePathMock,
    }))

    it('感想の追加ができる', async () => {
      prismaMock.$transaction.mockImplementationOnce((callback) => callback(prismaMock))
      prismaMock.impression.create.mockResolvedValueOnce({
        id: 99,
        bookId: book1.id,
        userId: user1.id,
        impression: '感想',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      const formData = new FormData()
      formData.append('impression', '感想')

      const result = await addImpression(
        {
          success: false,
          value: { impression: '前回データ' },
          apiError: null,
        },
        formData,
        book1.id,
      )

      expect(result.success).toBe(true)
      expect(result.value).toStrictEqual({ impression: '' })
      expect(result.errors).toBeUndefined()
      expect(result.apiError).toBeNull()
      expect(prismaMock.impression.create).toHaveBeenCalledWith({
        data: {
          bookId: book1.id,
          userId: user1.id,
          impression: '感想',
        },
      })
      expect(revalidatePathMock).toHaveBeenCalledWith(`/books/${book1.id}`)
    })

    it('セッションが取得できなかった場合はエラーを返す', async () => {
      consoleErrorSpy.mockImplementationOnce(() => {})
      getServerSessionMock.mockResolvedValueOnce(null)

      const result = await addImpression(
        {
          success: false,
          value: { impression: '' },
          apiError: null,
        },
        new FormData(),
        book1.id,
      )

      expect(result.success).toBe(false)
      expect(result.value).toStrictEqual({ impression: '' })
      expect(result.apiError).toBeInstanceOf(Error)
      expect((result.apiError as Error).message).toBe(
        '感想の追加に失敗しました。もう一度試して見てください。',
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith('セッションが取得できませんでした')
    })

    it('バリデーションに失敗した場合はエラーを返す', async () => {
      const formData = new FormData()
      formData.append('impression', '')

      const result = await addImpression(
        {
          success: false,
          value: { impression: '前回データ' },
          apiError: null,
        },
        formData,
        book1.id,
      )

      expect(result.success).toBe(false)
      expect(result.value).toStrictEqual({ impression: '' })
      expect(result.errors).toStrictEqual({ impression: ['1文字以上入力してください'] })
      expect(result.apiError).toBeNull()
    })

    it('DB操作に失敗した場合はエラーを返す', async () => {
      consoleErrorSpy.mockImplementationOnce(() => {})
      prismaMock.$transaction.mockImplementationOnce((callback) => callback(prismaMock))
      const expectedError = new Error('DB error has occurred')
      prismaMock.impression.create.mockRejectedValueOnce(expectedError)
      const formData = new FormData()
      formData.append('impression', 'DB更新失敗')

      const result = await addImpression(
        {
          success: false,
          value: { impression: '前回データ' },
          apiError: null,
        },
        formData,
        book1.id,
      )

      expect(result.success).toBe(false)
      expect(result.value).toStrictEqual({ impression: 'DB更新失敗' })
      expect(result.errors).toBeUndefined()
      expect(result.apiError).toBeInstanceOf(Error)
      expect((result.apiError as Error).message).toBe(
        '感想の追加に失敗しました。もう一度試して見てください。',
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith(expectedError)
    })
  })
})
