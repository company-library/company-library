/**
 * server側で実行されるコードのため、テスト環境をnodeに変更する
 * https://stackoverflow.com/questions/76379428/how-to-test-nextjs-app-router-api-route-with-jest
 * @jest-environment node
 */

import { GET } from '@/app/api/books/search/route'
import { bookWithImage, bookWithoutImage } from '../../../../__utils__/data/book'
import { prismaMock } from '../../../../__utils__/libs/prisma/singleton'

describe('books search api', () => {
  const expectedBooks = [bookWithImage, bookWithoutImage]

  const searchWord = 'testBook'
  const req = {
    url: `http://localhost:3000/api/books/search?q=${searchWord}`,
  } as Request

  it('本の一覧を取得し、それを返す', async () => {
    prismaMock.book.findMany.mockResolvedValueOnce(expectedBooks)

    const result = await GET(req)

    expect(result.status).toBe(200)
    const books = (await result.json()).books
    expect(books.length).toBe(2)
    books.forEach((book: any, index: number) => {
      expect(book.id).toBe(expectedBooks[index].id)
      expect(book.title).toBe(expectedBooks[index].title)
      expect(book.isbn).toBe(expectedBooks[index].isbn)
      expect(book.imageUrl).toBe(expectedBooks[index].imageUrl)
      expect(book.createdAt).toBe(expectedBooks[index].createdAt.toISOString())
    })
  })

  it('検索キーワードを用いて絞り込みを行う', async () => {
    prismaMock.book.findMany.mockResolvedValueOnce(expectedBooks)

    await GET(req)

    expect(prismaMock.book.findMany).toBeCalledWith({
      where: { title: { contains: searchWord, mode: 'insensitive' } },
    })
  })

  it('本の一覧の取得に失敗した場合、既定のエラーを返す', async () => {
    console.error = jest.fn()
    const expectErrorMsg = 'query has errored!'
    prismaMock.book.findMany.mockRejectedValueOnce(expectErrorMsg)

    const result = await GET(req)

    expect(result.status).toBe(500)
    expect(await result.json()).toEqual({ errorCode: '500', message: 'Book fetch failed' })
    expect(console.error).toBeCalledWith(expectErrorMsg)
  })
})
