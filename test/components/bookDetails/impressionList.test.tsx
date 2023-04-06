import { render } from '@testing-library/react'
import ImpressionList from '@/components/bookDetails/impressionList'

const bookId = 10
const expectedImpressions = [
  {
    id: 1,
    user: {
      name: 'user01',
      imageUrl: '',
    },
    impression: '本の感想です。\n面白かったです。',
    createdAt: '2022-10-30T10:00:00+09:00',
    updatedAt: '2022-10-31T10:00:00+09:00',
  },
  {
    id: 2,
    user: {
      name: 'user02',
      imageUrl: '',
    },
    impression: '興味深い本でした',
    createdAt: '2022-11-01T10:00:00+09:00',
    updatedAt: '2022-11-01T10:00:00+09:00',
  },
  {
    id: 3,
    user: {
      name: 'user03',
      imageUrl: '',
    },
    impression: '感想',
    createdAt: '2022-10-20T10:00:00+09:00',
    updatedAt: '2022-10-21T10:00:00+09:00',
  },
]
const useGetImpressionsQueryMock = jest.fn().mockReturnValue([
  {
    fetching: false,
    error: undefined,
    data: { impressions: expectedImpressions },
  },
])
jest.mock('@/generated/graphql.client', () => ({
  __esModule: true,
  useGetImpressionsQuery: () => useGetImpressionsQueryMock(),
}))

describe('ImpressionList component', () => {
  it('本の感想を更新日の新しい順に表示する', () => {
    const { getByTestId } = render(<ImpressionList bookId={bookId} />)

    expect(getByTestId(`postedDate-${0}`).textContent).toBe('2022/11/01')
    expect(getByTestId(`postedUser-${0}`).textContent).toBe('u')
    expect(getByTestId(`impression-${0}`).textContent).toBe('興味深い本でした')
    expect(getByTestId(`postedDate-${1}`).textContent).toBe('2022/10/31')
    expect(getByTestId(`postedUser-${1}`).textContent).toBe('u')
    expect(getByTestId(`impression-${1}`).textContent).toBe('本の感想です。\n面白かったです。')
    expect(getByTestId(`postedDate-${2}`).textContent).toBe('2022/10/21')
    expect(getByTestId(`postedUser-${2}`).textContent).toBe('u')
    expect(getByTestId(`impression-${2}`).textContent).toBe('感想')
  })

  it('感想は、改行を反映して表示する', () => {
    const { getByTestId } = render(<ImpressionList bookId={bookId} />)

    expect(getByTestId(`impression-${0}`)).toHaveClass('whitespace-pre-wrap')
    expect(getByTestId(`impression-${1}`)).toHaveClass('whitespace-pre-wrap')
    expect(getByTestId(`impression-${2}`)).toHaveClass('whitespace-pre-wrap')
  })

  it('感想が書かれていない場合は、そのことを表示する', () => {
    useGetImpressionsQueryMock.mockReturnValueOnce([
      { fetching: false, error: undefined, data: { impressions: [] } },
    ])

    const { getByText } = render(<ImpressionList bookId={bookId} />)

    expect(getByText('まだ感想が書かれていません😢')).toBeInTheDocument()
  })

  it('読み込み中は、「Loading...」と表示する', () => {
    useGetImpressionsQueryMock.mockReturnValueOnce([{ fetching: true }])

    const { getByText } = render(<ImpressionList bookId={bookId} />)

    expect(getByText('Loading...')).toBeInTheDocument()
  })

  it('読み込みでエラーが発生した場合は、「Error!」と表示する', () => {
    const expectedError = new Error('error occurred!')
    useGetImpressionsQueryMock.mockReturnValueOnce([{ fetching: false, error: expectedError }])
    console.error = jest.fn()

    const { getByText } = render(<ImpressionList bookId={bookId} />)

    expect(getByText('Error!')).toBeInTheDocument()
    expect(console.error).toBeCalledWith(expectedError)
  })
})
