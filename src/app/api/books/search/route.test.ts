import { NextRequest } from 'next/server'
import { GET } from '@/app/api/books/search/route'
import type { Book } from '@/models/book'
import { bookWithImage, bookWithoutImage } from '../../../../../test/__utils__/data/book'
import { prismaMock } from '../../../../../test/__utils__/libs/prisma/singleton'

describe('books search api', () => {
  const expectedBooks = [bookWithImage, bookWithoutImage]

  const req = new NextRequest('http://localhost:3000/api/books/search')

  it('本の一覧を取得し、それを返す', async () => {
    prismaMock.book.findMany.mockResolvedValueOnce(expectedBooks)

    const result = await GET(req)

    expect(result.status).toBe(200)
    const books = (await result.json()).books
    expect(books.length).toBe(2)
    books.forEach((book: Book, index: number) => {
      expect(book.id).toBe(expectedBooks[index].id)
      expect(book.title).toBe(expectedBooks[index].title)
      expect(book.isbn).toBe(expectedBooks[index].isbn)
      expect(book.imageUrl).toBe(expectedBooks[index].imageUrl)
      expect(book.createdAt).toBe(expectedBooks[index].createdAt.toISOString())
    })
  })

  it('検索キーワード(タイトル、概要)を用いて絞り込みを行う', async () => {
    const searchWord = 'testBook'
    const reqWithSearchWord = new NextRequest(
      `http://localhost:3000/api/books/search?q=${searchWord}`,
    )

    prismaMock.book.findMany.mockResolvedValueOnce(expectedBooks)

    await GET(reqWithSearchWord)

    expect(prismaMock.book.findMany).toBeCalledWith({
      where: {
        OR: [
          { title: { contains: searchWord, mode: 'insensitive' } },
          { description: { contains: searchWord, mode: 'insensitive' } },
        ],
        registrationHistories: {
          some: {
            location: {
              id: undefined,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('保管場所IDで絞り込みを行う', async () => {
    const locationId = '1'
    const reqWithLocationId = new NextRequest(
      `http://localhost:3000/api/books/search?locationId=${locationId}`,
    )

    prismaMock.book.findMany.mockResolvedValueOnce(expectedBooks)

    await GET(reqWithLocationId)

    expect(prismaMock.book.findMany).toBeCalledWith({
      where: {
        OR: [
          { title: { contains: '', mode: 'insensitive' } },
          { description: { contains: '', mode: 'insensitive' } },
        ],
        registrationHistories: {
          some: {
            location: {
              id: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('検索キーワードと保管場所IDの両方で絞り込みを行う', async () => {
    const searchWord = 'testBook'
    const locationId = '2'
    const reqWithBothParams = new NextRequest(
      `http://localhost:3000/api/books/search?q=${searchWord}&locationId=${locationId}`,
    )

    prismaMock.book.findMany.mockResolvedValueOnce(expectedBooks)

    await GET(reqWithBothParams)

    expect(prismaMock.book.findMany).toBeCalledWith({
      where: {
        OR: [
          { title: { contains: searchWord, mode: 'insensitive' } },
          { description: { contains: searchWord, mode: 'insensitive' } },
        ],
        registrationHistories: {
          some: {
            location: {
              id: 2,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('作成日時の降順でソートされている', async () => {
    prismaMock.book.findMany.mockResolvedValueOnce(expectedBooks)

    await GET(req)

    expect(prismaMock.book.findMany).toBeCalledWith({
      where: {
        OR: [
          { title: { contains: '', mode: 'insensitive' } },
          { description: { contains: '', mode: 'insensitive' } },
        ],
        registrationHistories: {
          some: {
            location: {
              id: undefined,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('本の一覧の取得に失敗した場合、既定のエラーを返す', async () => {
    console.error = vi.fn()
    const expectErrorMsg = 'query has errored!'
    prismaMock.book.findMany.mockRejectedValueOnce(expectErrorMsg)

    const result = await GET(req)

    expect(result.status).toBe(500)
    expect(await result.json()).toEqual({ errorCode: '500', message: 'Book fetch failed' })
    expect(console.error).toBeCalledWith(expectErrorMsg)
  })
})
