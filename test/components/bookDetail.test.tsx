import BookDetail from '@/components/bookDetail'
import { render } from '@testing-library/react'
import { lendableBook } from '../__utils__/data/book'

// next/imageのモック
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? 'alt'} />
  },
}))

describe('BookDetail component', () => {
  jest.spyOn(require('@/components/lendButton'), 'default').mockImplementation(() => {
    return <button>借りる</button>
  })
  jest
    .spyOn(require('@/components/returnButton'), 'default')
    .mockReturnValue(<button>返却する</button>)
  const expectedUserId = 1
  jest
    .spyOn(require('@/hooks/useCustomUser'), 'useCustomUser')
    .mockReturnValue({ user: { id: expectedUserId } })

  it('本の情報が表示される', async () => {
    const book = lendableBook
    const { getByText, getByRole, getByAltText } = render(<BookDetail book={book} />)

    expect(getByAltText(book.title)).toBeInTheDocument()
    expect(getByAltText(book.title)).toHaveAttribute('src', book.imageUrl)
    expect(getByText(book.title)).toBeInTheDocument()
    expect(getByText(`${1}冊貸し出し可能`)).toBeInTheDocument()
    expect(getByText(`所蔵数: ${2}冊`)).toBeInTheDocument()
    expect(getByText(`予約数: ${1}件`)).toBeInTheDocument()
    expect(getByRole('button', { name: '借りる' })).toBeInTheDocument()
    expect(getByRole('button', { name: '返却する' })).toBeInTheDocument()
  })

  describe('借りている人', () => {
    it('貸出中のユーザーがいる場合、その一覧が返却予定日の昇順で表示される', () => {
      const lendingBook = {
        ...lendableBook,
        reservations: [],
        lendingHistories: [
          {
            id: 1,
            createdAt: '2022-10-01',
            user: { id: 1, name: 'user01', impressions: [] },
            dueDate: '2022-10-24',
            returnHistories: [],
          },
          {
            id: 2,
            createdAt: '2022-10-01',
            user: { id: 2, name: 'user02', impressions: [] },
            dueDate: '2022-10-08',
            returnHistories: [],
          },
          {
            id: 3,
            createdAt: '2022-10-01',
            user: { id: 3, name: 'user03', impressions: [] },
            dueDate: '2022-10-15',
            returnHistories: [],
          },
        ],
      }

      const { getByText, getByTestId } = render(<BookDetail book={lendingBook} />)

      expect(getByText('借りている人')).toBeInTheDocument()
      expect(getByTestId(`dueDate-${0}`).textContent).toBe('2022/10/08')
      expect(getByTestId(`lendingUser-${0}`).textContent).toBe('user02')
      expect(getByTestId(`dueDate-${1}`).textContent).toBe('2022/10/15')
      expect(getByTestId(`lendingUser-${1}`).textContent).toBe('user03')
      expect(getByTestId(`dueDate-${2}`).textContent).toBe('2022/10/24')
      expect(getByTestId(`lendingUser-${2}`).textContent).toBe('user01')
    })

    it('貸出中のユーザーがいない場合、項目ごと表示されない', () => {
      const { queryByText } = render(<BookDetail book={lendableBook} />)

      expect(queryByText('借りている人')).not.toBeInTheDocument()
    })
  })

  describe('借りた人', () => {
    it('返却済の貸出履歴がある場合、その一覧が返却日の昇順で表示される', () => {
      const returnedBook = {
        ...lendableBook,
        reservations: [],
        lendingHistories: [
          {
            id: 1,
            createdAt: '2022-10-01',
            user: { id: 1, name: 'user01', impressions: [] },
            dueDate: '2022-10-24',
            returnHistories: [{ createdAt: '2022-10-20' }],
          },
          {
            id: 2,
            createdAt: '2022-10-01',
            user: {
              id: 2,
              name: 'user02',
              impressions: [
                {
                  impression: '感想を書きました',
                  createdAt: '2022-10-30',
                  updatedAt: '2022-10-30',
                },
              ],
            },
            dueDate: '2022-10-08',
            returnHistories: [{ createdAt: '2022-10-30' }],
          },
          {
            id: 3,
            createdAt: '2022-10-01',
            user: { id: 3, name: 'user03', impressions: [] },
            dueDate: '2022-10-15',
            returnHistories: [{ createdAt: '2022-10-25' }],
          },
        ],
      }

      const { getByText, getByTestId } = render(<BookDetail book={returnedBook} />)

      expect(getByText('借りた人')).toBeInTheDocument()
      expect(getByTestId(`returnedDate-${0}`).textContent).toBe('2022/10/30')
      expect(getByTestId(`returnedUser-${0}`).textContent).toBe('user02')
      expect(getByTestId(`impression-${0}`).textContent).toBe('感想を書きました')
      expect(getByTestId(`returnedDate-${1}`).textContent).toBe('2022/10/25')
      expect(getByTestId(`returnedUser-${1}`).textContent).toBe('user03')
      expect(getByTestId(`impression-${1}`).textContent).toBe('')
      expect(getByTestId(`returnedDate-${2}`).textContent).toBe('2022/10/20')
      expect(getByTestId(`returnedUser-${2}`).textContent).toBe('user01')
      expect(getByTestId(`impression-${2}`).textContent).toBe('')
    })

    it('返却済の貸出履歴がない場合、いないことが表示される', () => {
      const { getByText } = render(<BookDetail book={lendableBook} />)

      expect(getByText('借りた人')).toBeInTheDocument()
      expect(getByText('いません')).toBeInTheDocument()
    })
  })
})
