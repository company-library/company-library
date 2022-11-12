import { render } from '@testing-library/react'
import Layout from '@/components/layout'
import { bookWithImage, bookWithoutImage } from '../__utils__/data/book'

jest.mock('@/components/layout')

describe('index page', () => {
  const useGetBooksQueryMock = jest
    .spyOn(require('@/generated/graphql.client'), 'useGetBooksQuery')
    .mockReturnValue([
      {
        fetching: false,
        error: false,
        data: {
          books: [bookWithImage, bookWithoutImage],
        },
      },
    ])

  const LayoutMock = (Layout as jest.Mock).mockImplementation(({ children }) => {
    return <div>{children}</div>
  })

  const TopPage = require('@/pages/index').default

  it('本の一覧が表示される', () => {
    const { getByText } = render(<TopPage />)

    expect(LayoutMock.mock.calls[0][0].title).toBe('トップページ | company-library')
    expect(getByText(bookWithImage.title)).toBeInTheDocument()
    expect(getByText(bookWithoutImage.title)).toBeInTheDocument()
  })

  it('本の一覧の読み込み中は「Loading...」と表示される', () => {
    useGetBooksQueryMock.mockReturnValueOnce([{ fetching: true }])

    const { getByText } = render(<TopPage />)

    expect(getByText('Loading...')).toBeInTheDocument()
  })

  it('本の一覧の読み込みに失敗した場合、「Error!」と表示される', () => {
    const expectErrorMsg = 'query has errored!'
    console.error = jest.fn()
    useGetBooksQueryMock.mockReturnValueOnce([{ fetching: false, error: expectErrorMsg }])
    const { getByText, rerender } = render(<TopPage />)
    expect(getByText('Error!')).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectErrorMsg)

    useGetBooksQueryMock.mockReturnValueOnce([{ fetching: false, error: false, data: undefined }])
    rerender(<TopPage />)
    expect(getByText('Error!')).toBeInTheDocument()
    // errorがfalseの場合は、console.errorが呼び出されない
    expect(console.error).toBeCalledTimes(1)
  })
})
