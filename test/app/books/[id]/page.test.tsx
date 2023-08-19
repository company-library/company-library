import { render, screen } from '@testing-library/react'
import { prismaMock } from '../../../__utils__/libs/prisma/singleton'
import { user1, user2 } from '../../../__utils__/data/user'
import { bookWithImage } from '../../../__utils__/data/book'

const BookDetailMock = jest.fn().mockReturnValue(<div>xxx</div>)
jest.mock('@/app/books/[[id]]/bookDetail', () => ({
  __esModule: true,
  default: (...args: any) => BookDetailMock(...args),
}))

const getServerSessionMock = jest.fn().mockReturnValue({ customUser: { id: 1 } })
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

  it('本の情報の読み込みが完了した場合は、詳細情報を表示する', async () => {
    const bookId = bookWithImage.id

    render(await BookDetailPage({ params: { id: bookId } }))

    expect(BookDetailMock).toBeCalledWith({ bookId: bookId }, {})
  })

  it('セッションが取得できなかった場合は、エラーメッセージを表示する', async () => {
    getServerSessionMock.mockReturnValueOnce(null)

    render(await BookDetailPage({ params: { id: '1' } }))

    expect(
      screen.getByText('セッションが取得できませんでした。再読み込みしてみてください。'),
    ).toBeInTheDocument()
  })
})
