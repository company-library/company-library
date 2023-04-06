import { render } from '@testing-library/react'
import { bookWithImage, bookWithoutImage } from '../__utils__/data/book'
import BookList from '@/components/bookList'

const books = [bookWithImage, bookWithoutImage]
const useGetBooksQueryMock = jest.fn().mockReturnValue([
  {
    fetching: false,
    error: false,
    data: {
      books,
    },
  },
])
jest.mock('@/generated/graphql.client', () => ({
  __esModule: true,
  useGetBooksByIdsQuery: () => useGetBooksQueryMock(),
}))

describe('BookList component', () => {
  it('本の一覧が表示される', () => {
    const { getByText } = render(<BookList ids={books.map((book) => book.id)} />)

    expect(getByText(bookWithImage.title)).toBeInTheDocument()
    expect(getByText(bookWithoutImage.title)).toBeInTheDocument()
  })

  it('本がない場合は「該当の書籍はありません」というメッセージが表示される', () => {
    useGetBooksQueryMock.mockReturnValueOnce([
      {
        fetching: false,
        error: false,
        data: {
          books: [],
        },
      },
    ])

    const { getByText } = render(<BookList ids={books.map((book) => book.id)} />)

    expect(getByText('該当の書籍はありません')).toBeInTheDocument()
  })

  it('本の一覧の読み込み中は「Loading...」というメッセージが表示される', () => {
    useGetBooksQueryMock.mockReturnValueOnce([{ fetching: true }])

    const { getByText } = render(<BookList ids={books.map((book) => book.id)} />)

    expect(getByText('Loading...')).toBeInTheDocument()
  })

  it('本の一覧の読み込みに失敗した場合、「Error!」というメッセージが表示される', () => {
    const expectErrorMsg = 'query has errored!'
    console.error = jest.fn()
    useGetBooksQueryMock.mockReturnValueOnce([{ fetching: false, error: expectErrorMsg }])

    const { getByText } = render(<BookList ids={books.map((book) => book.id)} />)

    expect(getByText('Error!')).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectErrorMsg)
  })
})
