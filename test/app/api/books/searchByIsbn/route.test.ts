import { GET } from '@/app/api/books/searchByIsbn/route'
import { prismaMock } from '../../../../__utils__/libs/prisma/singleton'
import { bookWithImage } from '../../../../__utils__/data/book'

describe('books searchByIsbn api', () => {
  const expectedBook = bookWithImage

  const searchWord = 'testBook'
  const req = {
    url: `http://localhost:3000/api/books/searchByIsbn?isbn=${searchWord}`,
  } as Request

  it('本の詳細情報を取得し、それを返す', async () => {
    prismaMock.book.findUnique.mockResolvedValueOnce(expectedBook)

    const result = await GET(req)

    expect(result.status).toBe(200)
    const book = (await result.json()).book
    expect(book.id).toBe(expectedBook.id)
    expect(book.title).toBe(expectedBook.title)
    expect(book.isbn).toBe(expectedBook.isbn)
    expect(book.imageUrl).toBe(expectedBook.imageUrl)
    expect(book.createdAt).toBe(expectedBook.createdAt.toISOString())
  })

  it('本の詳細情報の取得に失敗した場合、既定のエラーを返す', async () => {
    console.error = vi.fn()
    const expectErrorMsg = 'query has errored!'
    prismaMock.book.findUnique.mockRejectedValueOnce(expectErrorMsg)

    const result = await GET(req)

    expect(result.status).toBe(500)
    expect(await result.json()).toEqual({ errorCode: '500', message: 'Book fetch failed' })
    expect(console.error).toBeCalledWith(expectErrorMsg)
  })
})
