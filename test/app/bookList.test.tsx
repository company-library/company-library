import { fireEvent, render, screen } from '@testing-library/react'
import { bookWithImage, bookWithoutImage } from '../__utils__/data/book'
import useSWR from 'swr'
import fetcher from '@/libs/swr/fetcher'
import { Mock } from 'vitest'

vi.mock('swr')

describe('BookList page', async () => {
  const TopPage = (await import('@/app/bookList')).default

  const swrMock = useSWR as Mock
  swrMock.mockReturnValue({
    data: {
      books: [bookWithImage, bookWithoutImage],
    },
  })

  it.todo('ページタイトルが「トップページ | company-library」である')

  it('本の一覧が表示される', () => {
    render(<TopPage />)

    expect(screen.getByText(bookWithImage.title)).toBeInTheDocument()
    expect(screen.getByText(bookWithoutImage.title)).toBeInTheDocument()
  })

  it('検索キーワードの入力フォームに入力があると、検索される', () => {
    const searchWord = 'testBook'

    render(<TopPage />)
    fireEvent.change(screen.getByPlaceholderText('書籍のタイトルで検索'), {
      target: { value: searchWord },
    })

    expect(swrMock).toBeCalledWith(`/api/books/search?q=${searchWord}`, fetcher)
  })

  it('本の一覧の読み込み中は「Loading...」と表示される', () => {
    swrMock.mockReturnValueOnce({ data: undefined })

    render(<TopPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('本の一覧の読み込みに失敗した場合、「Error!」と表示される', () => {
    const expectErrorMsg = 'query has errored!'
    console.error = vi.fn()
    swrMock.mockReturnValueOnce({ data: {}, error: expectErrorMsg })
    const { rerender } = render(<TopPage />)
    expect(screen.getByText('Error!')).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectErrorMsg)

    swrMock.mockReturnValueOnce({ data: { errorCode: '123', message: expectErrorMsg } })
    rerender(<TopPage />)
    expect(screen.getByText('Error!')).toBeInTheDocument()
    // errorがfalsyの場合は、console.errorが呼び出されない
    expect(console.error).toBeCalledTimes(1)
  })
})
