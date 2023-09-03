import { render, screen } from '@testing-library/react'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'
import { user1, user2 } from '../../../__utils__/data/user'
import { bookWithImage } from '../../../__utils__/data/book'

const BookDetailMock = jest.fn().mockReturnValue(<div>bookDetail</div>)
jest.mock('@/components/bookDetail', () => ({
  __esModule: true,
  default: (...args: any) => BookDetailMock(...args),
}))

const LendingListMock = jest.fn().mockReturnValue(<div>lendingList</div>)
jest.mock('@/app/books/[id]/lendingList', () => ({
  __esModule: true,
  default: (...args: any) => LendingListMock(...args),
}))

const ImpressionListMock = jest.fn().mockReturnValue(<div>impressionList</div>)
jest.mock('@/app/books/[id]/impressionList', () => ({
  __esModule: true,
  default: (...args: any) => ImpressionListMock(...args),
}))

const ReturnListMock = jest.fn().mockReturnValue(<div>returnList</div>)
jest.mock('@/app/books/[id]/returnList', () => ({
  __esModule: true,
  default: (...args: any) => ReturnListMock(...args),
}))

const getServerSessionMock = jest.fn().mockReturnValue({ customUser: { id: user1.id } })
jest.mock('next-auth', () => ({
  __esModule: true,
  getServerSession: () => getServerSessionMock(),
}))

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  __esModule: true,
  authOptions: {},
}))

describe('BookDetail page', () => {
  prismaMock.user.findMany.mockResolvedValue([user1, user2])

  const BookDetailPage = require('@/app/books/[id]/page').default

  const book = bookWithImage

  it('本の情報の読み込みが完了した場合は、詳細情報を表示する', async () => {
    render(await BookDetailPage({ params: { id: book.id } }))

    expect(BookDetailMock).toBeCalledWith({ bookId: book.id, userId: user1.id }, {})
    const heading2s = screen.getAllByRole('heading', { level: 2 })
    expect(heading2s.length).toBe(3)
    expect(heading2s[0].textContent).toBe('借りている人')
    expect(heading2s[1].textContent).toBe('感想')
    expect(heading2s[2].textContent).toBe('借りた人')
    expect(LendingListMock).toBeCalledWith({ bookId: book.id }, {})
    expect(ImpressionListMock).toBeCalledWith({ bookId: book.id }, {})
    expect(ReturnListMock).toBeCalledWith({ bookId: book.id }, {})
  })

  it('セッションが取得できなかった場合は、エラーメッセージを表示する', async () => {
    getServerSessionMock.mockReturnValueOnce(null)

    render(await BookDetailPage({ params: { id: '1' } }))

    expect(
      screen.getByText('セッションが取得できませんでした。再読み込みしてみてください。'),
    ).toBeInTheDocument()
  })

  it('書籍のIDが数値でなかった場合は、エラーメッセージを表示する', async () => {
    const { rerender } = render(await BookDetailPage({ params: { id: 'true' } }))
    expect(screen.getByText('不正な書籍です。')).toBeInTheDocument()

    rerender(await BookDetailPage({ params: { id: '1n' } }))
    expect(screen.getByText('不正な書籍です。')).toBeInTheDocument()
  })

  it('セッションが取得できなかった場合は、エラーメッセージを表示する', async () => {
    getServerSessionMock.mockReturnValueOnce(null)

    render(await BookDetailPage({ params: { id: '1' } }))

    expect(
      screen.getByText('セッションが取得できませんでした。再読み込みしてみてください。'),
    ).toBeInTheDocument()
  })
})
