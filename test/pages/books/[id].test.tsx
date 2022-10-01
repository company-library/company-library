import BookDetailPage from '@/pages/books/[id]'
import { render } from '@testing-library/react'
import { lendableBook } from '../../__utils__/data/book'

describe('BookDetail page', () => {
  const expectedBook = lendableBook

  jest
    .spyOn(require('next/router'), 'useRouter')
    .mockReturnValue({ query: { id: expectedBook.id } })

  const useGetBookQueryMock = jest
    .spyOn(require('@/generated/graphql.client'), 'useGetBookQuery')
    .mockReturnValue([{ fetching: false, error: false, data: { books: [expectedBook] } }])

  const LayoutMock = jest
    .spyOn(require('@/components/layout'), 'default')
    .mockImplementation((props: any) => {
      return <div>{props.children}</div>
    })

  const BookDetailMock = jest
    .spyOn(require('@/components/bookDetail'), 'default')
    .mockReturnValue(<div>bookDetail</div>)

  it('本の情報の読み込みが完了した場合は、先頭の本を表示する', () => {
    render(<BookDetailPage />)

    // @ts-expect-error
    expect(LayoutMock.mock.calls[0][0]['title']).toBe(`${expectedBook.title} | company-library`)
    // @ts-expect-error
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
