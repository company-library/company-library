import { addBook, registerBook } from '@/app/books/register/actions'
import type { Book } from '@/generated/prisma/client'
import { location1 } from '../../../../test/__utils__/data/location'
import { user1 } from '../../../../test/__utils__/data/user'
import { prismaMock } from '../../../../test/__utils__/libs/prisma/singleton'

describe('server actions', () => {
  const { redirectMock } = vi.hoisted(() => {
    return { redirectMock: vi.fn() }
  })
  vi.mock('next/navigation', () => ({
    redirect: redirectMock,
  }))

  const { notifySlackMock } = vi.hoisted(() => {
    return { notifySlackMock: vi.fn() }
  })
  vi.mock('@/libs/slack/webhook', () => ({
    notifySlack: notifySlackMock,
  }))

  vi.mock('@/libs/vercel/downloadAndPutImage', () => ({
    downloadAndPutImage: async (imageUrl: string | undefined, isbn: string) => {
      if (imageUrl) {
        return `https://example.com/books/${isbn}/internal/cover.jpg`
      }
      return undefined
    },
  }))

  describe('registerBook function', () => {
    it('書籍と登録履歴の追加ができる', async () => {
      const bookId = 1
      const title = 'testBook'
      const description = 'テスト書籍の概要'
      const isbn = '1234567890123'
      const now = new Date()
      const userId = user1.id
      const locationId = location1.id
      prismaMock.book.create.mockResolvedValueOnce({
        id: bookId,
        title,
        description,
        isbn,
        imageUrl: 'https://example.com/books/1234567890123/internal/cover.jpg',
        createdAt: now,
      } as Book)
      prismaMock.registrationHistory.create.mockResolvedValueOnce({
        id: 1,
        bookId: bookId,
        userId: userId,
        locationId: 1,
        createdAt: new Date(),
      })

      const result = await registerBook(
        title,
        description,
        isbn,
        `https://example.com/books/${isbn}/external/cover.jpg`,
        locationId,
        userId,
      )

      expect(result).toBeUndefined()
      expect(prismaMock.book.create).toBeCalledWith({
        data: {
          title,
          description,
          isbn,
          imageUrl: 'https://example.com/books/1234567890123/internal/cover.jpg',
        },
      })
      expect(prismaMock.registrationHistory.create).toBeCalledWith({
        data: {
          bookId,
          userId,
          locationId,
        },
      })
      expect(notifySlackMock).toBeCalledWith(`「${title}」という書籍が登録されました。`)
      expect(redirectMock).toBeCalled()
    })

    it('書籍の追加に失敗した場合はエラーをスローする', async () => {
      const title = 'testBook'
      const description = 'テスト書籍の概要'
      const isbn = '1234567890123'
      const userId = user1.id
      const locationId = location1.id

      const error = new Error('error has occurred')
      prismaMock.book.create.mockRejectedValueOnce(error)
      const errorMock = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(
        registerBook(title, description, isbn, undefined, locationId, userId),
      ).rejects.toThrow('Book creation failed')

      expect(prismaMock.book.create).toBeCalledWith({
        data: {
          title,
          description,
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
      const description = 'テスト書籍の概要'
      const isbn = '1234567890123'
      const now = new Date()
      const userId = user1.id
      const locationId = location1.id

      const error = new Error('error has occurred')
      prismaMock.book.create.mockResolvedValueOnce({
        id: bookId,
        title,
        description,
        isbn,
        imageUrl: null,
        createdAt: now,
      } as Book)
      prismaMock.registrationHistory.create.mockRejectedValueOnce(error)
      const errorMock = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(
        registerBook('testBook', 'テスト書籍の概要', '1234567890123', undefined, 1, user1.id),
      ).rejects.toThrow('Registration creation failed')

      expect(prismaMock.book.create).toBeCalledWith({
        data: {
          title,
          description,
          isbn,
          imageUrl: undefined,
        },
      })
      expect(prismaMock.registrationHistory.create).toBeCalledWith({
        data: {
          bookId,
          userId,
          locationId,
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
      const locationId = location1.id
      prismaMock.registrationHistory.create.mockResolvedValueOnce({
        id: 1,
        bookId,
        userId,
        locationId,
        createdAt: new Date(),
      })

      const result = await addBook(bookId, userId, locationId)

      expect(result).toBeUndefined()
      expect(prismaMock.registrationHistory.create).toBeCalledWith({
        data: {
          bookId,
          userId,
          locationId,
        },
      })
      expect(redirectMock).toBeCalled()
    })

    it('登録履歴の追加に失敗した場合はエラーをスローする', async () => {
      const bookId = 1
      const userId = user1.id
      const locationId = location1.id
      const error = new Error('error has occurred')
      prismaMock.registrationHistory.create.mockRejectedValueOnce(error)
      const errorMock = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(addBook(bookId, userId, locationId)).rejects.toThrow(
        'Registration creation failed',
      )

      expect(prismaMock.registrationHistory.create).toBeCalledWith({
        data: {
          bookId,
          userId,
          locationId,
        },
      })
      expect(redirectMock).not.toBeCalled()
      expect(errorMock).toBeCalledWith(error)
    })
  })
})
