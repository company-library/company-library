import BookDetailPage from '@/app/books/[id]/page'
import { render } from '@testing-library/react'
import { lendableBook } from '../../../__utils__/data/book'

const expectedBook = lendableBook

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => {
    return { query: { id: expectedBook.id } }
  },
}))

const useGetBookQueryMock = jest
  .fn()
  .mockReturnValue([{ fetching: false, error: false, data: { books: [expectedBook] } }])
jest.mock('@/generated/graphql.client', () => ({
  __esModule: true,
  useGetBookQuery: () => useGetBookQueryMock(),
}))

const LayoutMock = jest.fn().mockImplementation((props) => {
  return <div>{props.children}</div>
})
jest.mock('@/components/layout', () => {
  return {
    __esModule: true,
    default: (...args: any) => LayoutMock(...args),
  }
})

const BookDetailMock = jest.fn().mockImplementation(() => <div>bookDetail</div>)
jest.mock('@/components/bookDetail', () => {
  return {
    __esModule: true,
    default: (...args: any) => BookDetailMock(...args),
  }
})

describe('BookDetail page', () => {
  it('本の情報の読み込みが完了した場合は、先頭の本を表示する', () => {
    render(<BookDetailPage />)

    expect(LayoutMock.mock.calls[0][0]['title']).toBe(`${expectedBook.title} | company-library`)
    expect(BookDetailMock.mock.calls[0][0]['book']).toBe(expectedBook)
  })

  it('本の情報の読み込み中は、「Loading...」と表示する', () => {
    useGetBookQueryMock.mockReturnValueOnce([{ fetching: true }])

    const { getByText } = render(<BookDetailPage />)

    expect(getByText('Loading...')).toBeInTheDocument()
  })

  it('本の情報の読み込みでエラーが発生した場合は、「Error!」と表示する', () => {
    useGetBookQueryMock.mockReturnValueOnce([{ fetching: false, error: true }])

    const { getByText } = render(<BookDetailPage />)

    expect(getByText('Error!')).toBeInTheDocument()
  })
})
