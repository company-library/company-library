/**
 * server側で実行されるコードのため、テスト環境をnodeに変更する
 * https://stackoverflow.com/questions/76379428/how-to-test-nextjs-app-router-api-route-with-jest
 * @jest-environment node
 */

import { prismaMock } from '../../../__utils__/libs/prisma/singleton'
import { user1 } from '../../../__utils__/data/user'
import { addBook, registerBook } from '@/app/books/register/actions'

const redirectMock = jest.fn()
jest.mock('next/navigation', () => ({
  __esModule: true,
  redirect: () => redirectMock(),
}))

const notifySlackMock = jest.fn()
jest.mock('@/libs/slack/webhook', () => ({
  __esModule: true,
  notifySlack: (msg: string) => notifySlackMock(msg),
}))

jest.mock('@/libs/vercel/downloadAndPutImage', () => ({
  __esModule: true,
  downloadAndPutImage: async (imageUrl: string | undefined, isbn: string) => {
    if (imageUrl) {
      return `https://example.com/books/${isbn}/internal/cover.jpg`
    }
    return undefined
  },
}))

describe('server actions', () => {
  describe('registerBook function', () => {
    it('書籍と登録履歴の追加ができる', async () => {
      const bookId = 1
      const title = 'testBook'
      const isbn = '1234567890123'
      const now = new Date()
      const userId = user1.id
      prismaMock.book.create.mockResolvedValueOnce({
        id: bookId,
        title,
        isbn,
        imageUrl: 'https://example.com/books/1234567890123/internal/cover.jpg',
        createdAt: now,
      })
      prismaMock.registrationHistory.create.mockResolvedValueOnce({
        id: 1,
        bookId: bookId,
        userId: userId,
        createdAt: new Date(),
      })

      const result = await registerBook(
        title,
        isbn,
        `https://example.com/books/${isbn}/external/cover.jpg`,
        userId,
      )

      expect(result).toBeUndefined()
      expect(prismaMock.book.create).toBeCalledWith({
        data: {
          title,
          isbn,
          imageUrl: 'https://example.com/books/1234567890123/internal/cover.jpg',
        },
      })
      expect(prismaMock.registrationHistory.create).toBeCalledWith({
        data: {
          bookId: bookId,
          userId: userId,
        },
      })
      expect(notifySlackMock).toBeCalledWith(`「${title}」という書籍が登録されました。`)
      expect(redirectMock).toBeCalled()
    })

    it('書籍の追加に失敗した場合はエラーを返す', async () => {
      const title = 'testBook'
      const isbn = '1234567890123'
      const error = new Error('error has occurred')
      const userId = user1.id
      prismaMock.book.create.mockRejectedValueOnce(error)
      const errorMock = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = await registerBook(title, isbn, undefined, userId)

      expect(result.message).toBe('Book creation failed')
      expect(prismaMock.book.create).toBeCalledWith({
        data: {
          title,
          isbn,
          imageUrl: undefined,
        },
      })
      expect(prismaMock.registrationHistory.create).not.toBeCalled()
      expect(errorMock).toBeCalledWith(error)
      expect(redirectMock).not.toBeCalled()
    })

    it('登録履歴の追加に失敗した場合はエラーを返す', async () => {
      const bookId = 1
      const title = 'testBook'
      const isbn = '1234567890123'
      const now = new Date()
      const error = new Error('error has occurred')
      prismaMock.book.create.mockResolvedValueOnce({
        id: bookId,
        title,
        isbn,
        imageUrl: null,
        createdAt: now,
      })
      prismaMock.registrationHistory.create.mockRejectedValueOnce(error)
      const errorMock = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = await registerBook('testBook', '1234567890123', undefined, user1.id)

      expect(result.message).toBe('Registration creation failed')
      expect(prismaMock.book.create).toBeCalledWith({
        data: {
          title,
          isbn,
          imageUrl: undefined,
        },
      })
      expect(prismaMock.registrationHistory.create).toBeCalledWith({
        data: {
          bookId: bookId,
          userId: user1.id,
        },
      })
      expect(errorMock).toBeCalledWith(error)
      expect(redirectMock).not.toBeCalled()
    })
  })

  describe('addBook function', () => {
    it('登録履歴の追加ができる', async () => {
      const bookId = 1
      const userId = user1.id
      prismaMock.registrationHistory.create.mockResolvedValueOnce({
        id: 1,
        bookId: bookId,
        userId: userId,
        createdAt: new Date(),
      })

      const result = await addBook(bookId, userId)

      expect(result).toBeUndefined()
      expect(prismaMock.registrationHistory.create).toBeCalledWith({
        data: {
          bookId: bookId,
          userId: userId,
        },
      })
      expect(redirectMock).toBeCalled()
    })

    it('登録履歴の追加に失敗した場合はエラーを返す', async () => {
      const bookId = 1
      const userId = user1.id
      const error = new Error('error has occurred')
      prismaMock.registrationHistory.create.mockRejectedValueOnce(error)
      const errorMock = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = await addBook(bookId, userId)

      expect(result.message).toBe('Registration creation failed')
      expect(prismaMock.registrationHistory.create).toBeCalledWith({
        data: {
          bookId: bookId,
          userId: userId,
        },
      })
      expect(redirectMock).not.toBeCalled()
      expect(errorMock).toBeCalledWith(error)
    })
  })
})
