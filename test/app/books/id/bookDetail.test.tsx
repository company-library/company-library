import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { expect } from 'vitest'
import BookDetail from '@/app/books/[id]/bookDetail'
import { bookWithoutImage, lendableBook } from '../../../__utils__/data/book'

const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      book: {
        findUnique: vi.fn()
      }
    }
  }
})

vi.mock('@/libs/prisma/client', () => ({
  default: prismaMock
}))

describe('BookDetail component', () => {
  const userId = 2

  const book = lendableBook
  const bookDetail = {
    title: book.title,
    imageUrl: book.imageUrl,
    lendingHistories: book.lendingHistories,
    registrationHistories: book.registrationHistories,
    _count: {
      registrationHistories: book.registrationHistories.length,
      reservations: book.reservations.length,
    },
  }
  vi.mock('@/app/books/[id]/lendButton', () => ({
    default: (props: any) => {
      return (
        <button disabled={props.disabled} type="button">
          借りる
        </button>
      )
    },
  }))

  vi.mock('@/app/books/[id]/returnButton', () => ({
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
    expect(screen.getByRole('button', { name: '返却する' })).toBeInTheDocument()
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

  it('貸し出し可能数は、場所ごとに比例配分される', async () => {
    const mockBookDetail = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: '本社' } },
        { locationId: 1, location: { id: 1, name: '本社' } },
        { locationId: 1, location: { id: 1, name: '本社' } },
        { locationId: 2, location: { id: 2, name: '支社' } },
        { locationId: 2, location: { id: 2, name: '支社' } },
      ],
      lendingHistories: [
        { id: 1, userId: 10 },
        { id: 2, userId: 11 },
      ],
      _count: {
        reservations: 0,
      },
    }
    prismaMock.book.findUnique.mockResolvedValue(mockBookDetail)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)
    
    // 本社: 3冊登録、貸出2冊の60%（1.2冊）なので1冊貸出、2冊利用可能
    expect(screen.getByText('本社')).toBeInTheDocument()
    expect(screen.getByText('2冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 3冊)')).toBeInTheDocument()

    // 支社: 2冊登録、貸出2冊の40%（0.8冊）なので1冊貸出、1冊利用可能
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
        { id: 1, userId: 10 },
        { id: 2, userId: 11 },
      ],
      _count: {
        reservations: 0,
      },
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
        { id: 1, userId: 10 },
        { id: 2, userId: userId }, // ユーザーが借りている
      ],
      _count: {
        reservations: 0,
      },
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

  it('借りるボタンは、貸し出し可能数が1冊以上 かつ 借用中ではない 場合、有効である', async () => {
    const mockBookAvailable = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: 'オフィス' } },
        { locationId: 1, location: { id: 1, name: 'オフィス' } },
        { locationId: 1, location: { id: 1, name: 'オフィス' } },
      ],
      lendingHistories: [
        { id: 1, userId: 10 },
      ],
      _count: {
        reservations: 0,
      },
    }
    prismaMock.book.findUnique.mockResolvedValue(mockBookAvailable)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)
    expect(screen.getByRole('button', { name: '借りる' })).toBeEnabled()
  })

  it('返却するボタンは、借用中の場合、有効である', async () => {
    const mockBookUserBorrowing = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: 'オフィス' } },
        { locationId: 1, location: { id: 1, name: 'オフィス' } },
      ],
      lendingHistories: [
        { id: 1, userId: userId }, // ユーザーが借りている
      ],
      _count: {
        reservations: 0,
      },
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

  it('返却するボタンは、借用中ではない場合、無効である', async () => {
    const mockBookNotBorrowing = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: 'オフィス' } },
      ],
      lendingHistories: [
        { id: 1, userId: 10 }, // 他のユーザーが借りている
      ],
      _count: {
        reservations: 0,
      },
    }
    prismaMock.book.findUnique.mockResolvedValue(mockBookNotBorrowing)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)
    expect(screen.getByRole('button', { name: '返却する' })).toBeDisabled()
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

  it('保管場所ごとの在庫情報が正しく計算・表示される', async () => {
    const mockBookWithLocation = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: '本社' } },
        { locationId: 1, location: { id: 1, name: '本社' } },
        { locationId: 1, location: { id: 1, name: '本社' } },
        { locationId: 2, location: { id: 2, name: '支社' } },
        { locationId: 2, location: { id: 2, name: '支社' } },
      ],
      lendingHistories: [
        { id: 1, userId: 10 },
        { id: 2, userId: 11 },
      ],
      _count: {
        reservations: 1,
      },
    }
    prismaMock.book.findUnique.mockResolvedValue(mockBookWithLocation)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)

    // 本社: 3冊登録、貸出2冊の60%（1.2冊）なので1冊貸出、2冊利用可能
    expect(screen.getByText('本社')).toBeInTheDocument()
    expect(screen.getByText('2冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 3冊)')).toBeInTheDocument()

    // 支社: 2冊登録、貸出2冊の40%（0.8冊）なので1冊貸出、1冊利用可能
    expect(screen.getByText('支社')).toBeInTheDocument()
    expect(screen.getByText('1冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 2冊)')).toBeInTheDocument()
  })

  it('同一保管場所の複数登録で在庫数が正しく集計される', async () => {
    const mockBookSameLocation = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: '東京オフィス' } },
        { locationId: 1, location: { id: 1, name: '東京オフィス' } },
        { locationId: 1, location: { id: 1, name: '東京オフィス' } },
        { locationId: 1, location: { id: 1, name: '東京オフィス' } },
        { locationId: 1, location: { id: 1, name: '東京オフィス' } },
      ],
      lendingHistories: [
        { id: 1, userId: 10 },
        { id: 2, userId: 11 },
      ],
      _count: {
        reservations: 0,
      },
    }
    prismaMock.book.findUnique.mockResolvedValue(mockBookSameLocation)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)

    // 東京オフィス: 5冊登録、2冊貸出なので3冊利用可能
    expect(screen.getByText('東京オフィス')).toBeInTheDocument()
    expect(screen.getByText('3冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 5冊)')).toBeInTheDocument()
  })

  it('貸出数が在庫数を上回る場合、貸し出し可能数は0になる', async () => {
    const mockBookOverLent = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: '小規模オフィス' } },
        { locationId: 1, location: { id: 1, name: '小規模オフィス' } },
      ],
      lendingHistories: [
        { id: 1, userId: 10 },
        { id: 2, userId: 11 },
        { id: 3, userId: 12 },
        { id: 4, userId: 13 },
        { id: 5, userId: 14 },
      ],
      _count: {
        reservations: 0,
      },
    }
    prismaMock.book.findUnique.mockResolvedValue(mockBookOverLent)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)

    // 小規模オフィス: 2冊登録、5冊貸出なので0冊利用可能
    expect(screen.getByText('小規模オフィス')).toBeInTheDocument()
    expect(screen.getByText('0冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 2冊)')).toBeInTheDocument()
  })

  it('複数保管場所での比例配分計算が正確に行われる', async () => {
    const mockBookMultiLocation = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: 'A拠点' } },
        { locationId: 1, location: { id: 1, name: 'A拠点' } },
        { locationId: 1, location: { id: 1, name: 'A拠点' } },
        { locationId: 1, location: { id: 1, name: 'A拠点' } },
        { locationId: 2, location: { id: 2, name: 'B拠点' } },
        { locationId: 2, location: { id: 2, name: 'B拠点' } },
        { locationId: 3, location: { id: 3, name: 'C拠点' } },
      ],
      lendingHistories: [
        { id: 1, userId: 10, locationId: 1 },
      ],
      _count: {
        reservations: 2,
      },
    }
    prismaMock.book.findUnique.mockResolvedValue(mockBookMultiLocation)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)

    expect(screen.getByText('A拠点')).toBeInTheDocument()
    expect(screen.getByText('3冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 4冊)')).toBeInTheDocument()

    expect(screen.getByText('B拠点')).toBeInTheDocument()
    expect(screen.getByText('2冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 2冊)')).toBeInTheDocument()

    expect(screen.getByText('C拠点')).toBeInTheDocument()
    expect(screen.getByText('1冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 1冊)')).toBeInTheDocument()
  })

  it('保管場所情報が不完全な場合は無視される', async () => {
    const mockBookIncompleteLocation = {
      ...bookDetail,
      registrationHistories: [
        { locationId: 1, location: { id: 1, name: '正常な拠点' } },
        { locationId: null, location: null }, // 不完全なデータ
        { locationId: 2, location: null }, // locationが欠落
        { locationId: null, location: { id: 3, name: '不完全' } }, // locationIdが欠落
        { locationId: 1, location: { id: 1, name: '正常な拠点' } },
      ],
      lendingHistories: [],
      _count: {
        reservations: 0,
      },
    }
    prismaMock.book.findUnique.mockResolvedValue(mockBookIncompleteLocation)

    render(
      <Suspense>
        <BookDetail bookId={book.id} userId={userId} />
      </Suspense>,
    )

    await screen.findByText(book.title)

    // 正常な拠点のみが表示される（2冊登録）
    expect(screen.getByText('正常な拠点')).toBeInTheDocument()
    expect(screen.getByText('2冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 2冊)')).toBeInTheDocument()

    // 不完全なデータは表示されない
    expect(screen.queryByText('不完全')).not.toBeInTheDocument()
  })
})
