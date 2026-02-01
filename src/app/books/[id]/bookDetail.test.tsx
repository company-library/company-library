import { render, screen } from '@testing-library/react'
import BookDetailClient from '@/app/books/[id]/bookDetailClient'

const { useRouterMock } = vi.hoisted(() => {
  return {
    useRouterMock: vi.fn(() => ({
      refresh: vi.fn(),
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      replace: vi.fn(),
    })),
  }
})

vi.mock('next/navigation', () => ({
  useRouter: useRouterMock,
}))

describe('BookDetailClient component', () => {
  const mockLocationStats: [
    number,
    {
      name: string
      order: number
      totalCount: number
      lendableCount: number
    },
  ][] = [
    [
      1,
      {
        name: '1階 エントランス',
        order: 1,
        totalCount: 2,
        lendableCount: 1,
      },
    ],
    [
      2,
      {
        name: '2階 開発室',
        order: 2,
        totalCount: 3,
        lendableCount: 2,
      },
    ],
  ]

  const defaultProps = {
    bookId: 1,
    userId: 2,
    title: 'テスト書籍',
    imageUrl: 'https://example.com/book.jpg',
    locationStats: mockLocationStats,
    isLendable: true,
    isLending: false,
    lendingHistoryId: 0,
    returnLocation: undefined,
  }

  it('本の詳細情報が表示される', () => {
    render(<BookDetailClient {...defaultProps} />)

    expect(screen.getByAltText('テスト書籍')).toBeInTheDocument()
    expect(screen.getByText('テスト書籍')).toBeInTheDocument()
    expect(screen.getByText('1階 エントランス')).toBeInTheDocument()
    expect(screen.getByText('2階 開発室')).toBeInTheDocument()
  })

  it('場所ごとの貸し出し可能数が表示される', () => {
    render(<BookDetailClient {...defaultProps} />)

    expect(screen.getByText('1冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 2冊)')).toBeInTheDocument()
    expect(screen.getByText('2冊貸し出し可能')).toBeInTheDocument()
    expect(screen.getByText('(所蔵数: 3冊)')).toBeInTheDocument()
  })

  it('画像がない場合はno_imageが表示される', () => {
    render(<BookDetailClient {...defaultProps} imageUrl={null} />)

    const img = screen.getByAltText('テスト書籍')
    expect(img).toHaveAttribute('src', expect.stringContaining('no_image.jpg'))
  })

  it('貸し出し可能な場合、借りるボタンが有効である', () => {
    render(<BookDetailClient {...defaultProps} isLendable={true} />)

    const lendButton = screen.getByRole('button', { name: '借りる' })
    expect(lendButton).toBeEnabled()
  })

  it('貸し出し不可の場合、借りるボタンが無効である', () => {
    render(<BookDetailClient {...defaultProps} isLendable={false} />)

    const lendButton = screen.getByRole('button', { name: '借りる' })
    expect(lendButton).toBeDisabled()
  })

  it('借用中の場合、返却するボタンが有効である', () => {
    render(<BookDetailClient {...defaultProps} isLending={true} />)

    const returnButton = screen.getByRole('button', { name: '返却する' })
    expect(returnButton).toBeEnabled()
  })

  it('借用していない場合、返却するボタンが無効である', () => {
    render(<BookDetailClient {...defaultProps} isLending={false} />)

    const returnButton = screen.getByRole('button', { name: '返却する' })
    expect(returnButton).toBeDisabled()
  })

  it('場所がorderの昇順で表示される', () => {
    const unorderedStats: [
      number,
      {
        name: string
        order: number
        totalCount: number
        lendableCount: number
      },
    ][] = [
      [3, { name: '3階 会議室', order: 3, totalCount: 1, lendableCount: 1 }],
      [1, { name: '1階 エントランス', order: 1, totalCount: 1, lendableCount: 1 }],
      [2, { name: '2階 開発室', order: 2, totalCount: 1, lendableCount: 1 }],
    ]

    render(<BookDetailClient {...defaultProps} locationStats={unorderedStats} />)

    const locationElements = screen.getAllByText(/階/)
    expect(locationElements[0]).toHaveTextContent('1階 エントランス')
    expect(locationElements[1]).toHaveTextContent('2階 開発室')
    expect(locationElements[2]).toHaveTextContent('3階 会議室')
  })

  it('感想を書くボタンが表示される', () => {
    render(<BookDetailClient {...defaultProps} />)

    expect(screen.getByRole('button', { name: '感想を書く' })).toBeInTheDocument()
  })
})
