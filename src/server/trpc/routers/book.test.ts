import { TRPCError } from '@trpc/server'
import type { Session } from 'next-auth'
import { createCaller } from '@/server/trpc/routers/_app'
import { bookWithImage, bookWithoutImage } from '../../../../test/__utils__/data/book'
import { user1 } from '../../../../test/__utils__/data/user'
import { prismaMock } from '../../../../test/__utils__/libs/prisma/singleton'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))

describe('book router', () => {
  const session = { customUser: user1 } as unknown as Session
  const caller = createCaller({ session })
  const unauthorizedCaller = createCaller({ session: null })

  describe('search', () => {
    const expectedBooks = [bookWithImage, bookWithoutImage]

    const expectedQuery = (q: string, locationId: number | undefined) => ({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
        registrationHistories: {
          some: {
            location: {
              id: locationId,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    it('本の一覧を作成日時の降順で取得し、それを返す', async () => {
      prismaMock.book.findMany.mockResolvedValueOnce(expectedBooks)

      const result = await caller.book.search({})

      expect(result).toEqual(expectedBooks)
      expect(prismaMock.book.findMany).toBeCalledWith(expectedQuery('', undefined))
    })

    it('検索キーワード(タイトル、概要)を用いて絞り込みを行う', async () => {
      prismaMock.book.findMany.mockResolvedValueOnce(expectedBooks)

      await caller.book.search({ q: 'testBook' })

      expect(prismaMock.book.findMany).toBeCalledWith(expectedQuery('testBook', undefined))
    })

    it('保管場所IDを用いて絞り込みを行う', async () => {
      prismaMock.book.findMany.mockResolvedValueOnce(expectedBooks)

      await caller.book.search({ locationId: 1 })

      expect(prismaMock.book.findMany).toBeCalledWith(expectedQuery('', 1))
    })

    it('検索キーワードと保管場所IDの両方で絞り込みを行う', async () => {
      prismaMock.book.findMany.mockResolvedValueOnce(expectedBooks)

      await caller.book.search({ q: 'testBook', locationId: 2 })

      expect(prismaMock.book.findMany).toBeCalledWith(expectedQuery('testBook', 2))
    })

    it('保管場所IDが整数でない場合、BAD_REQUESTを返す', async () => {
      await expect(caller.book.search({ locationId: 1.5 })).rejects.toMatchObject({
        code: 'BAD_REQUEST',
      })
      expect(prismaMock.book.findMany).not.toBeCalled()
    })

    it('本の一覧の取得に失敗した場合、INTERNAL_SERVER_ERRORを返す', async () => {
      console.error = vi.fn()
      const expectErrorMsg = 'query has errored!'
      prismaMock.book.findMany.mockRejectedValueOnce(expectErrorMsg)

      await expect(caller.book.search({})).rejects.toThrow(
        new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Book fetch failed' }),
      )
      expect(console.error).toBeCalledWith(expectErrorMsg)
    })

    it('未ログインの場合、UNAUTHORIZEDを返す', async () => {
      await expect(unauthorizedCaller.book.search({})).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      })
      expect(prismaMock.book.findMany).not.toBeCalled()
    })
  })

  describe('searchByIsbn', () => {
    const isbn = bookWithImage.isbn

    it('ISBNで本の詳細情報を取得し、それを返す', async () => {
      prismaMock.book.findUnique.mockResolvedValueOnce(bookWithImage)

      const result = await caller.book.searchByIsbn({ isbn })

      expect(result).toEqual(bookWithImage)
      expect(prismaMock.book.findUnique).toBeCalledWith({
        where: { isbn },
        include: {
          _count: {
            select: { registrationHistories: true },
          },
        },
      })
    })

    it('本の詳細情報の取得に失敗した場合、INTERNAL_SERVER_ERRORを返す', async () => {
      console.error = vi.fn()
      const expectErrorMsg = 'query has errored!'
      prismaMock.book.findUnique.mockRejectedValueOnce(expectErrorMsg)

      await expect(caller.book.searchByIsbn({ isbn })).rejects.toThrow(
        new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Book fetch failed' }),
      )
      expect(console.error).toBeCalledWith(expectErrorMsg)
    })

    it('未ログインの場合、UNAUTHORIZEDを返す', async () => {
      await expect(unauthorizedCaller.book.searchByIsbn({ isbn })).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      })
      expect(prismaMock.book.findUnique).not.toBeCalled()
    })
  })
})
