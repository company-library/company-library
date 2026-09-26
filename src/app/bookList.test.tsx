import { fireEvent, render, screen } from '@testing-library/react'
import useSWR from 'swr'
import type { Mock } from 'vitest'
import BookList from '@/app/bookList'
import { bookWithImage, bookWithoutImage } from '../../test/__utils__/data/book'
import { location1, location2 } from '../../test/__utils__/data/location'

vi.mock('swr')
const swrMock = useSWR as Mock

const { bookSearchQueryMock } = vi.hoisted(() => ({ bookSearchQueryMock: vi.fn() }))
vi.mock('@/libs/trpc/client', () => ({
  trpc: {
    book: { search: { query: bookSearchQueryMock } },
    location: { list: { query: vi.fn() } },
  },
}))

describe('BookList page', () => {
  beforeEach(() => {
    swrMock.mockClear()
    // Default mock for books search and locations
    swrMock.mockImplementation((key) => {
      if (key === 'location.list') {
        return { data: [location1, location2] }
      }
      return { data: [bookWithImage, bookWithoutImage] }
    })
  })

  it.todo('ページタイトルが「トップページ | company-library」である')

  it('本の一覧が表示される', () => {
    render(<BookList />)

    expect(screen.getByText(bookWithImage.title)).toBeInTheDocument()
    expect(screen.getByText(bookWithoutImage.title)).toBeInTheDocument()
  })

  it('検索キーワードの入力フォームに入力があると、検索される', () => {
    const searchWord = 'testBook'

    render(<BookList />)
    fireEvent.change(screen.getByPlaceholderText('書籍のタイトルで検索'), {
      target: { value: searchWord },
    })

    expect(swrMock).toBeCalledWith(['book.search', searchWord, ''], expect.any(Function))
  })

  it('本の一覧の読み込み中は「Loading...」と表示される', () => {
    swrMock.mockImplementation((key) => {
      if (key === 'location.list') {
        return { data: [location1, location2] }
      }
      return { data: undefined }
    })

    render(<BookList />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('保管場所の選択肢が表示される', () => {
    render(<BookList />)

    expect(screen.getByText('全ての保管場所')).toBeInTheDocument()
    expect(screen.getByText(location1.name)).toBeInTheDocument()
    expect(screen.getByText(location2.name)).toBeInTheDocument()
  })

  it('保管場所を選択すると、選択した場所で絞り込み検索される', () => {
    render(<BookList />)
    const locationSelect = screen.getByRole('combobox')

    fireEvent.change(locationSelect, { target: { value: location1.id.toString() } })

    expect(swrMock).toBeCalledWith(
      ['book.search', '', location1.id.toString()],
      expect.any(Function),
    )
  })

  it('保管場所と検索キーワードの両方を指定して検索される', () => {
    const searchWord = 'testBook'

    render(<BookList />)

    // Select location
    const locationSelect = screen.getByRole('combobox')
    fireEvent.change(locationSelect, { target: { value: location1.id.toString() } })

    // Enter search keyword
    fireEvent.change(screen.getByPlaceholderText('書籍のタイトルで検索'), {
      target: { value: searchWord },
    })

    expect(swrMock).toBeCalledWith(
      ['book.search', searchWord, location1.id.toString()],
      expect.any(Function),
    )
  })

  it.each([
    { testcase: '保管場所の指定なし', locationId: '', expectedLocationId: undefined },
    { testcase: '保管場所の指定あり', locationId: '2', expectedLocationId: 2 },
  ])('書籍検索のtRPCクエリが呼び出される($testcase)', ({ locationId, expectedLocationId }) => {
    render(<BookList />)

    const [, fetcher] = swrMock.mock.calls.find(([key]) => Array.isArray(key)) ?? []
    fetcher(['book.search', 'testBook', locationId])

    expect(bookSearchQueryMock).toBeCalledWith({ q: 'testBook', locationId: expectedLocationId })
  })

  it('保管場所データの取得に失敗した場合でも、空の配列として扱われる', () => {
    // Mock locations data with error
    swrMock.mockImplementation((key) => {
      if (key === 'location.list') {
        return { data: undefined, error: new Error('Failed to fetch locations') }
      }
      return { data: [bookWithImage, bookWithoutImage] }
    })

    render(<BookList />)

    expect(screen.getByText('全ての保管場所')).toBeInTheDocument()
    // Only default option should be present
    expect(screen.queryByText(location1.name)).not.toBeInTheDocument()
  })

  it('本の一覧の読み込みに失敗した場合、「Error!」と表示される', () => {
    const expectErrorMsg = 'query has errored!'
    console.error = vi.fn()

    swrMock.mockImplementation((key) => {
      if (key === 'location.list') {
        return { data: [location1, location2] }
      }
      return { data: undefined, error: expectErrorMsg }
    })

    render(<BookList />)
    expect(screen.getByText('Error!')).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectErrorMsg)
  })
})
