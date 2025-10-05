import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { expect } from 'vitest'
import BookDetail from '@/app/books/[id]/bookDetail'
import type { LendButtonProps } from '@/app/books/[id]/lendButton'
import { bookWithoutImage, lendableBook } from '../../../../test/__utils__/data/book'
import { prismaMock } from '../../../../test/__utils__/libs/prisma/singleton'

describe('BookDetail component', () => {
  const userId = 2

  const book = lendableBook
  const bookDetail = {
    id: book.id,
    createdAt: book.createdAt,
    updatedAt: null,
    title: book.title,
    description: book.description,
    isbn: book.isbn,
    imageUrl: book.imageUrl,
    registrationHistories: book.registrationHistories,
    lendingHistories: book.lendingHistories,
    _count: {
      reservations: book.reservations.length,
    },
  }
  vi.mock('@/app/books/[id]/lendButton', () => ({
    default: (props: LendButtonProps) => {
      return (
        <button disabled={props.disabled} type="button">
          借りる
        </button>
      )
    },
  }))

  vi.mock('@/app/books/[id]/returnButton', () => ({
    // biome-ignore lint/suspicious/noExplicitAny: テスト用のモック関数の型なのでany型を許容する
    default: (props: any) => {
      return (
        <button disabled={props.disabled} type="button">
          返却する
        </button>
      )
    },
  }))

  beforeEach(() => {
    prismaMock.book.findUnique.mockResolvedValue(bookDetail)
  })

  it('本の詳細情報と操作ボタンが表示される', async () => {
    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByAltText(book.title)).toBeInTheDocument()
    expect(screen.getByAltText(book.title)).toHaveAttribute(
      'src',
      expect.stringContaining(encodeURIComponent(book.imageUrl)),
    )
    expect(screen.getByText(book.title)).toBeInTheDocument()
    // 場所ごとの表示を確認
    expect(screen.getByText('1階 エントランス')).toBeInTheDocument()
    expect(screen.getByText('2階 開発室')).toBeInTheDocument()
    // 各場所で1冊ずつあるので、それぞれ1冊貸し出し可能
    expect(screen.getAllByText('1冊貸し出し可能')).toHaveLength(2)
    expect(screen.getAllByText('(所蔵数: 1冊)')).toHaveLength(2)

    expect(screen.getByRole('button', { name: '借りる' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '借りる' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '返却する' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '返却する' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '感想を書く' })).toBeInTheDocument()
  })

  it('本の書影が無い場合はno_imageが表示される', async () => {
    prismaMock.book.findUnique.mockResolvedValue({
      ...bookDetail,
      imageUrl: bookWithoutImage.imageUrl,
    })

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByAltText(book.title)).toBeInTheDocument()
    expect(screen.getByAltText(book.title)).toHaveAttribute(
      'src',
      expect.stringContaining(encodeURIComponent('/no_image.jpg')),
    )
  })

  it('貸し出し可能数は、場所ごとに正しい所蔵数が表示される', async () => {
    const mockBookDetail = {
      ...bookDetail,
      registrationHistories: [
        // 本社に4冊登録
        { locationId: 1, location: { id: 1, name: '本社' } },
        { locationId: 1, location: { id: 1, name: '本社' } },
        { locationId: 1, location: { id: 1, name: '本社' } },
        { locationId: 1, location: { id: 1, name: '本社' } },
        // 支社に2冊登録
        { locationId: 2, location: { id: 2, name: '支社' } },
        { locationId: 2, location: { id: 2, name: '支社' } },
      ],
      lendingHistories: [
        // 現在3冊が貸出中
        { id: 1, userId: 10, locationId: 1 },
        { id: 2, userId: 11, locationId: 1 },
        { id: 3, userId: 12, locationId: 2 },
      ],
      _count: {
        reservations: 0,
      },
      updatedAt: null,
    }
    prismaMock.book.findUnique.mockResolvedValue(mockBookDetail)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)

    expect(screen.getByText('本社')).toBeInTheDocument()
    expect(screen.getByText('2冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 4冊)')).toBeInTheDocument()

    expect(screen.getByText('支社')).toBeInTheDocument()
    expect(screen.getByText('1冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 2冊)')).toBeInTheDocument()
  })

  it('借りるボタンは、貸し出し可能数が0冊の場合、無効である', async () => {
    const mockBookAllLent = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: '小規模オフィス' } },
        { locationId: 1, location: { id: 1, name: '小規模オフィス' } },
      ],
      lendingHistories: [
        { id: 1, userId: 10, locationId: 1 },
        { id: 2, userId: 11, locationId: 1 },
      ],
      _count: {
        reservations: 0,
      },
      updatedAt: null,
    }
    prismaMock.book.findUnique.mockResolvedValue(mockBookAllLent)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)
    expect(screen.getByText('0冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '借りる' })).toBeDisabled()
  })

  it('借りるボタンは、借用中の場合、無効である', async () => {
    const mockBookUserBorrowing = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: 'オフィス' } },
        { locationId: 1, location: { id: 1, name: 'オフィス' } },
        { locationId: 1, location: { id: 1, name: 'オフィス' } },
      ],
      lendingHistories: [
        { id: 1, userId: 10, locationId: 1 },
        { id: 2, userId: userId, locationId: 1 }, // ユーザーが借りている
      ],
      _count: {
        reservations: 0,
      },
      updatedAt: null,
    }
    prismaMock.book.findUnique.mockResolvedValue(mockBookUserBorrowing)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)
    expect(screen.getByRole('button', { name: '借りる' })).toBeDisabled()
  })

  it('返却するボタンは、借用中の場合、有効である', async () => {
    const mockBookUserBorrowing = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: 'オフィス' } },
        { locationId: 1, location: { id: 1, name: 'オフィス' } },
      ],
      lendingHistories: [
        { id: 1, userId: userId, locationId: 1 }, // ユーザーが借りている
      ],
      _count: {
        reservations: 0,
      },
      updatedAt: null,
    }
    prismaMock.book.findUnique.mockResolvedValue(mockBookUserBorrowing)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)
    expect(screen.getByRole('button', { name: '返却する' })).toBeEnabled()
  })

  it('本の取得時にエラーが発生した場合、エラーメッセージが表示される', async () => {
    const expectedError = new Error('DBエラー')
    prismaMock.book.findUnique.mockRejectedValue(expectedError)
    console.error = vi.fn()

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(
      await screen.findByText('本の取得に失敗しました。再読み込みしてみてください。'),
    ).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectedError)
  })

  it('対象のIDで本が取得できなかった場合、エラーメッセージが表示される', async () => {
    prismaMock.book.findUnique.mockResolvedValue(null)
    console.error = vi.fn()

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    expect(
      await screen.findByText('本の取得に失敗しました。再読み込みしてみてください。'),
    ).toBeInTheDocument()
    expect(console.error).toBeCalledWith('対象のIDの本は存在しません。bookId:', book.id)
  })

  it('場所がorderの昇順で表示される', async () => {
    const mockBookDetail = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 3, location: { id: 3, name: '3階 会議室', order: 3 } },
        { locationId: 1, location: { id: 1, name: '1階 エントランス', order: 1 } },
        { locationId: 2, location: { id: 2, name: '2階 開発室', order: 2 } },
      ],
      lendingHistories: [],
      _count: {
        reservations: 0,
      },
      updatedAt: null,
    }
    prismaMock.book.findUnique.mockResolvedValue(mockBookDetail)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)

    const locationElements = screen.getAllByText(/階/)
    expect(locationElements[0]).toHaveTextContent('1階 エントランス')
    expect(locationElements[1]).toHaveTextContent('2階 開発室')
    expect(locationElements[2]).toHaveTextContent('3階 会議室')
  })
})
