import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prismaMock } from '../../../../../test/__utils__/libs/prisma/singleton'
import { GET } from './route'

// Mock external dependencies
vi.mock('@/libs/vercel/downloadAndPutImage', () => ({
  downloadAndPutImage: vi.fn().mockResolvedValue('https://blob.vercel-storage.com/test-image.jpg'),
}))

// Mock external API calls
const mockGoogleBooksResponse = {
  items: [
    {
      volumeInfo: {
        title: 'Test Book',
        description: 'Updated test description from Google Books API',
        imageLinks: {
          thumbnail: 'https://books.google.com/test-thumbnail.jpg',
        },
      },
    },
  ],
}

const mockOpenBDResponse = [
  {
    summary: {
      title: 'Test Book',
      cover: 'https://cover.openbd.jp/test-cover.jpg',
    },
  },
]

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('GET /api/books/update-missing-info', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('デフォルトフィルタで両方なしの書籍が処理される', async () => {
    const books = [
      {
        id: 1,
        title: 'Book A',
        description: '',
        isbn: '1111111111111',
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: 'Book B',
        description: '',
        isbn: '2222222222222',
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    prismaMock.book.findMany.mockResolvedValueOnce(books)

    const request = new NextRequest(
      'http://localhost:3000/api/books/update-missing-info?limit=10',
      {
        method: 'GET',
      },
    )

    const _response = await GET(request)

    expect(prismaMock.book.findMany).toHaveBeenCalledWith({
      where: {
        AND: [{ OR: [{ description: '' }, { imageUrl: null }] }],
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    })
  })

  it('説明文フィルタで説明文なしの書籍のみが処理される', async () => {
    const book = {
      id: 1,
      title: 'Test Book',
      description: '',
      isbn: '9784567890123',
      imageUrl: 'https://existing-image.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    prismaMock.book.findMany.mockResolvedValueOnce([book])
    prismaMock.book.update.mockResolvedValueOnce({
      ...book,
      description: 'Updated test description from Google Books API',
    })

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockGoogleBooksResponse),
      ok: true,
    })

    const request = new NextRequest(
      'http://localhost:3000/api/books/update-missing-info?limit=10&filter=description',
      {
        method: 'GET',
      },
    )

    const response = await GET(request)
    const _data = await response.json()

    expect(response.status).toBe(200)
    expect(prismaMock.book.findMany).toHaveBeenCalledWith({
      where: {
        AND: [{ description: '' }],
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    })
  })

  it('画像フィルタで画像なしの書籍のみが処理される', async () => {
    const book = {
      id: 1,
      title: 'Test Book',
      description: 'Existing description',
      isbn: '9784567890123',
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    prismaMock.book.findMany.mockResolvedValueOnce([book])

    const request = new NextRequest(
      'http://localhost:3000/api/books/update-missing-info?limit=10&filter=image',
      {
        method: 'GET',
      },
    )

    const _response = await GET(request)

    expect(prismaMock.book.findMany).toHaveBeenCalledWith({
      where: {
        AND: [{ imageUrl: null }],
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    })
  })

  it('作成日フィルタが正しく適用される', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/books/update-missing-info?limit=10&createdAfter=2024-01-01',
      {
        method: 'GET',
      },
    )

    prismaMock.book.findMany.mockResolvedValueOnce([])

    await GET(request)

    expect(prismaMock.book.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { OR: [{ description: '' }, { imageUrl: null }] },
          { createdAt: { gte: new Date('2024-01-01') } },
        ],
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    })
  })

  it('ISBN指定フィルタが正しく適用される', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/books/update-missing-info?limit=10&isbn=9784567890123',
      {
        method: 'GET',
      },
    )

    prismaMock.book.findMany.mockResolvedValueOnce([])

    await GET(request)

    expect(prismaMock.book.findMany).toHaveBeenCalledWith({
      where: {
        AND: [{ OR: [{ description: '' }, { imageUrl: null }] }, { isbn: '9784567890123' }],
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    })
  })

  it('最大件数が50件に制限される', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/books/update-missing-info?limit=100',
      {
        method: 'GET',
      },
    )

    prismaMock.book.findMany.mockResolvedValueOnce([])

    await GET(request)

    expect(prismaMock.book.findMany).toHaveBeenCalledWith({
      where: {
        AND: [{ OR: [{ description: '' }, { imageUrl: null }] }],
      },
      take: 50, // 最大50件に制限
      orderBy: {
        createdAt: 'desc',
      },
    })
  })

  it('空の説明文と画像URLがnullの書籍を更新する', async () => {
    // テストデータ準備
    const book = {
      id: 1,
      title: 'Test Book',
      description: '',
      isbn: '9784123456789',
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    prismaMock.book.findMany.mockResolvedValueOnce([book])
    prismaMock.book.update.mockResolvedValueOnce({
      ...book,
      description: 'Updated test description from Google Books API',
      imageUrl: 'https://blob.vercel-storage.com/test-image.jpg',
      updatedAt: new Date(),
    })

    // Mock API responses
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockGoogleBooksResponse),
      ok: true,
    })

    const request = new NextRequest(
      'http://localhost:3000/api/books/update-missing-info?limit=10',
      {
        method: 'GET',
      },
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.updatedCount).toBe(1)
    expect(data.results).toHaveLength(1)
    expect(data.results[0].updated).toHaveProperty('description')
    expect(data.results[0].updated).toHaveProperty('imageUrl')
    expect(prismaMock.book.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        description: 'Updated test description from Google Books API',
        imageUrl: 'https://blob.vercel-storage.com/test-image.jpg',
      },
    })
  })

  it('説明文のみが空の書籍は説明文のみ更新する', async () => {
    const book = {
      id: 2,
      title: 'Test Book 2',
      description: '',
      isbn: '9784123456790',
      imageUrl: 'https://existing-image.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    prismaMock.book.findMany.mockResolvedValueOnce([book])
    prismaMock.book.update.mockResolvedValueOnce({
      ...book,
      description: 'Updated test description from Google Books API',
    })

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockGoogleBooksResponse),
      ok: true,
    })

    const request = new NextRequest(
      'http://localhost:3000/api/books/update-missing-info?limit=10',
      {
        method: 'GET',
      },
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.updatedCount).toBe(1)
    expect(data.results[0].updated).toHaveProperty('description')
    expect(data.results[0].updated).not.toHaveProperty('imageUrl')
    expect(prismaMock.book.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: {
        description: 'Updated test description from Google Books API',
      },
    })
  })

  it('画像URLのみがnullの書籍は画像URLのみ更新する', async () => {
    const book = {
      id: 3,
      title: 'Test Book 3',
      description: 'Existing description',
      isbn: '9784123456791',
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    prismaMock.book.findMany.mockResolvedValueOnce([book])
    prismaMock.book.update.mockResolvedValueOnce({
      ...book,
      imageUrl: 'https://blob.vercel-storage.com/test-image.jpg',
    })

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockGoogleBooksResponse),
      ok: true,
    })

    const request = new NextRequest(
      'http://localhost:3000/api/books/update-missing-info?limit=10',
      {
        method: 'GET',
      },
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.updatedCount).toBe(1)
    expect(data.results[0].updated).not.toHaveProperty('description')
    expect(data.results[0].updated).toHaveProperty('imageUrl')
    expect(prismaMock.book.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: {
        imageUrl: 'https://blob.vercel-storage.com/test-image.jpg',
      },
    })
  })

  it('更新対象の書籍が見つからない場合', async () => {
    prismaMock.book.findMany.mockResolvedValueOnce([])

    const request = new NextRequest(
      'http://localhost:3000/api/books/update-missing-info?limit=10',
      {
        method: 'GET',
      },
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.updatedCount).toBe(0)
    expect(data.message).toBe('更新対象の書籍が見つかりませんでした')
  })

  it('limitパラメータを正しく処理する', async () => {
    const books = [
      {
        id: 4,
        title: 'Test Book 4',
        description: '',
        isbn: '9784123456792',
        imageUrl: null,
        createdAt: new Date(),
      },
      {
        id: 5,
        title: 'Test Book 5',
        description: '',
        isbn: '9784123456793',
        imageUrl: null,
        createdAt: new Date(),
      },
    ]

    prismaMock.book.findMany.mockResolvedValueOnce(books)
    prismaMock.book.update.mockResolvedValue({
      id: 0,
      title: '',
      description: '',
      isbn: '',
      imageUrl: '',
      createdAt: new Date(),
    })

    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockGoogleBooksResponse),
      ok: true,
    })

    const request = new NextRequest('http://localhost:3000/api/books/update-missing-info?limit=2', {
      method: 'GET',
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.totalProcessed).toBe(2) // limitに従って2件のみ処理
    expect(prismaMock.book.findMany).toHaveBeenCalledWith({
      where: {
        AND: [{ OR: [{ description: '' }, { imageUrl: null }] }],
      },
      take: 2,
      orderBy: {
        createdAt: 'desc',
      },
    })
  })

  it('Google Books APIが失敗した場合はOpenBD APIにフォールバックする', async () => {
    const book = {
      id: 6,
      title: 'Test Book 6',
      description: '',
      isbn: '9784123456795',
      imageUrl: null,
      createdAt: new Date(),
    }

    prismaMock.book.findMany.mockResolvedValueOnce([book])
    prismaMock.book.update.mockResolvedValueOnce({
      ...book,
      imageUrl: 'https://blob.vercel-storage.com/test-image.jpg',
    })

    // Google Books APIは失敗、OpenBD APIは成功
    mockFetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({}), // 空のレスポンス
        ok: true,
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockOpenBDResponse),
        ok: true,
      })

    const request = new NextRequest(
      'http://localhost:3000/api/books/update-missing-info?limit=10',
      {
        method: 'GET',
      },
    )

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.updatedCount).toBe(1)
    expect(prismaMock.book.update).toHaveBeenCalledWith({
      where: { id: 6 },
      data: {
        imageUrl: 'https://blob.vercel-storage.com/test-image.jpg',
      },
    })
  })
})
