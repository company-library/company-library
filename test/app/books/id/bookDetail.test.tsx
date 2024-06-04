import { render, screen } from '@testing-library/react'
import { bookWithoutImage, lendableBook } from '../../../__utils__/data/book'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'
import { Suspense } from 'react'

vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? 'alt'} />
  },
}))

vi.mock('@/app/books/[id]/lendButton', () => ({
  default: (...args: any[]) => {
    return <button disabled={args[0].disabled}>借りる</button>
  },
}))

vi.mock('@/app/books/[id]/returnButton', () => ({
  default: (...args: any[]) => {
    return <button disabled={args[0].disabled}>返却する</button>
  },
}))

describe('BookDetail component', async () => {
  const BookDetailComponent = (await import('@/app/books/[id]/bookDetail')).default

  const userId = 2

  const book = lendableBook
  const bookDetail = {
    title: book.title,
    imageUrl: book.imageUrl,
    lendingHistories: book.lendingHistories,
    _count: {
      registrationHistories: book.registrationHistories.length,
      reservations: book.reservations.length,
    },
  }
  const prismaBookMock = prismaMock.book.findUnique
  beforeEach(() => {
    // @ts-ignore
    prismaBookMock.mockResolvedValue(bookDetail)
  })

  it('本の詳細情報と操作ボタンが表示される', async () => {
    render(
      <Suspense>
        <BookDetailComponent bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByAltText(book.title)).toBeInTheDocument()
    expect(screen.getByAltText(book.title)).toHaveAttribute('src', book.imageUrl)
    expect(screen.getByText(book.title)).toBeInTheDocument()
    expect(screen.getByText(`${2}冊貸し出し可能`)).toBeInTheDocument()
    expect(screen.getByText(`所蔵数: ${2}冊`)).toBeInTheDocument()
    expect(screen.getByText(`予約数: ${1}件`)).toBeInTheDocument()

    expect(screen.getByRole('button', { name: '借りる' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '返却する' })).toBeInTheDocument()
  })

  it('本の書影が無い場合はno_imageが表示される', async () => {
    // @ts-ignore
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      imageUrl: bookWithoutImage.imageUrl,
    })

    render(
      <Suspense>
        <BookDetailComponent bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByAltText(book.title)).toBeInTheDocument()
    expect(screen.getByAltText(book.title)).toHaveAttribute('src', '/no_image.jpg')
  })

  it('貸し出し可能数は、 登録履歴数 - 未返却の貸出履歴数 である', async () => {
    const registrationHistoriesCount = 23
    const lendingHistoriesCount = 17
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      lendingHistories: [...Array(lendingHistoriesCount)].map((_, i) => i),
      _count: {
        registrationHistories: registrationHistoriesCount,
      },
    })

    render(
      <Suspense>
        <BookDetailComponent bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(
      await screen.findByText(
        `${registrationHistoriesCount - lendingHistoriesCount}冊貸し出し可能`,
      ),
    ).toBeInTheDocument()
  })

  it('所蔵数は、 登録履歴数 である', async () => {
    const registrationHistoriesCount = 23
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      _count: {
        registrationHistories: registrationHistoriesCount,
      },
    })

    render(
      <Suspense>
        <BookDetailComponent bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText(`所蔵数: ${registrationHistoriesCount}冊`)).toBeInTheDocument()
  })

  it('予約数は、 予約履歴数 である', async () => {
    const reservationsCount = 17
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      _count: {
        reservations: reservationsCount,
      },
    })

    render(
      <Suspense>
        <BookDetailComponent bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText(`予約数: ${reservationsCount}件`)).toBeInTheDocument()
  })

  it('借りるボタンは、貸し出し可能数が0冊の場合、無効である', async () => {
    const registrationHistoriesCount = 23
    const lendingHistories = [...Array(registrationHistoriesCount)].map((_, i) => ({
      id: i + 1,
      userId: 0,
    }))
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      lendingHistories: lendingHistories,
      _count: {
        registrationHistories: registrationHistoriesCount,
      },
    })

    render(
      <Suspense>
        <BookDetailComponent bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText(`${0}冊貸し出し可能`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '借りる' })).toBeDisabled()
  })

  it('借りるボタンは、借用中の場合、無効である', async () => {
    // 借りている
    const registrationHistoriesCount = 10
    const lendingHistories = [...Array(registrationHistoriesCount - 2)].map((_, i) => ({
      id: i + 1,
      userId: 0,
    }))
    const userLendingHistory = { userId: userId }
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      lendingHistories: [...lendingHistories, userLendingHistory],
      _count: {
        registrationHistories: registrationHistoriesCount,
      },
    })

    render(
      <Suspense>
        <BookDetailComponent bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText(`${1}冊貸し出し可能`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '借りる' })).toBeDisabled()
  })

  it('借りるボタンは、貸し出し可能数が1冊以上 かつ 借用中ではない 場合、有効である', async () => {
    const registrationHistoriesCount = 56
    const lendingHistories = [...Array(registrationHistoriesCount - 1)].map((_, i) => ({
      id: i + 1,
      userId: 0,
    }))
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      lendingHistories: lendingHistories,
      _count: {
        registrationHistories: registrationHistoriesCount,
      },
    })

    render(
      <Suspense>
        <BookDetailComponent bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByText(`${1}冊貸し出し可能`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '借りる' })).toBeEnabled()
  })

  it('返却するボタンは、借用中の場合、有効である', async () => {
    // 借りている
    const registrationHistoriesCount = 5
    const lendingHistories = [...Array(registrationHistoriesCount - 1)].map((_, i) => ({
      id: i + 1,
      userId: 0,
    }))
    const userLendingHistory = { userId: userId }
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      lendingHistories: [...lendingHistories, userLendingHistory],
      _count: {
        registrationHistories: registrationHistoriesCount,
      },
    })

    render(
      <Suspense>
        <BookDetailComponent bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByRole('button', { name: '返却する' })).toBeEnabled()
  })

  it('返却するボタンは、借用中ではない場合、無効である', async () => {
    // 借りている
    const registrationHistoriesCount = 8
    const lendingHistories = [...Array(registrationHistoriesCount)].map((_, i) => ({
      id: i + 1,
      userId: 0,
    }))
    prismaBookMock.mockResolvedValue({
      ...bookDetail,
      // @ts-ignore
      lendingHistories: [...lendingHistories],
      _count: {
        registrationHistories: registrationHistoriesCount,
      },
    })

    render(
      <Suspense>
        <BookDetailComponent bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(await screen.findByRole('button', { name: '返却する' })).toBeDisabled()
  })

  it('本の取得時にエラーが発生した場合、エラーメッセージが表示される', async () => {
    const expectedError = new Error('DBエラー')
    prismaBookMock.mockRejectedValue(expectedError)
    console.error = vi.fn()

    render(
      <Suspense>
        <BookDetailComponent bookId={book.id} userId={userId} />
      </Suspense>,
    )

    // Suspenseの解決を待つために、最初のテスト項目のみawaitを使う
    expect(
      await screen.findByText('本の取得に失敗しました。再読み込みしてみてください。'),
    ).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectedError)
  })

  it('対象のIDで本が取得できなかった場合、エラーメッセージが表示される', async () => {
    prismaBookMock.mockResolvedValue(null)
    console.error = vi.fn()

    render(
      <Suspense>
        <BookDetailComponent bookId={book.id} userId={userId} />
      </Suspense>,
    )

    expect(
      await screen.findByText('本の取得に失敗しました。再読み込みしてみてください。'),
    ).toBeInTheDocument()
    expect(console.error).toBeCalledWith('対象のIDの本は存在しません。bookId:', book.id)
  })
})
