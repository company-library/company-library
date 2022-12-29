import BookDetail from '@/components/bookDetail'
import { render } from '@testing-library/react'
import { lendableBook } from '../__utils__/data/book'
import { DateTime, Settings } from 'luxon'

// next/imageのモック
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? 'alt'} />
  },
}))

describe('BookDetail component', () => {
  const expectedNow = DateTime.local(2022, 10, 31, 10, 0, 0)
  Settings.now = () => expectedNow.toMillis()

  jest.spyOn(require('@/components/lendButton'), 'default').mockImplementation(() => {
    return <button>借りる</button>
  })
  jest
    .spyOn(require('@/components/returnButton'), 'default')
    .mockReturnValue(<button>返却する</button>)
  jest
    .spyOn(require('@/components/bookDetails/impressionList'), 'default')
    .mockReturnValue(<div>感想リスト</div>)
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
    const lendingBook = {
      ...lendableBook,
      reservations: [],
      lendingHistories: [
        {
          id: 1,
          createdAt: '2022-10-01',
          user: { id: 1, name: 'user01', impressions: [] },
          dueDate: '2022-11-01',
          returnHistories: [],
        },
        {
          id: 2,
          createdAt: '2022-10-01',
          user: { id: 2, name: 'user02', impressions: [] },
          dueDate: '2022-10-30',
          returnHistories: [],
        },
        {
          id: 3,
          createdAt: '2022-10-01',
          user: { id: 3, name: 'user03', impressions: [] },
          dueDate: '2022-10-31',
          returnHistories: [],
        },
      ],
    }

    it('貸出中のユーザーがいる場合、その一覧が返却予定日の昇順で表示される', () => {
      const { getByText, getByTestId } = render(<BookDetail book={lendingBook} />)

      expect(getByText('借りている人')).toBeInTheDocument()
      expect(getByTestId(`dueDate-${0}`).textContent).toBe('2022/10/30')
      expect(getByTestId(`lendingUser-${0}`).textContent).toBe('u')
      expect(getByTestId(`dueDate-${1}`).textContent).toBe('2022/10/31')
      expect(getByTestId(`lendingUser-${1}`).textContent).toBe('u')
      expect(getByTestId(`dueDate-${2}`).textContent).toBe('2022/11/01')
      expect(getByTestId(`lendingUser-${2}`).textContent).toBe('u')
    })

    it('返却予定日は、表示した日を過ぎていた場合、赤太字になる', () => {
      const { getByTestId } = render(<BookDetail book={lendingBook} />)

      expect(getByTestId(`dueDate-${0}`).textContent).toBe('2022/10/30')
      expect(getByTestId(`dueDate-${0}`)).toHaveClass('text-red-400', 'font-bold')
      expect(getByTestId(`dueDate-${1}`).textContent).toBe('2022/10/31')
      expect(getByTestId(`dueDate-${1}`)).not.toHaveClass('text-red-400')
      expect(getByTestId(`dueDate-${1}`)).not.toHaveClass('font-bold')
      expect(getByTestId(`dueDate-${2}`).textContent).toBe('2022/11/01')
      expect(getByTestId(`dueDate-${2}`)).not.toHaveClass('text-red-400')
      expect(getByTestId(`dueDate-${2}`)).not.toHaveClass('font-bold')
    })

    it('貸出中のユーザーがいない場合、項目ごと表示されない', () => {
      const { queryByText } = render(<BookDetail book={lendableBook} />)

      expect(queryByText('借りている人')).not.toBeInTheDocument()
    })
  })

  describe('感想', () => {
    it('感想のリストを表示する', () => {
      const { getByText } = render(<BookDetail book={lendableBook} />)

      expect(getByText('感想')).toBeInTheDocument()
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
            user: { id: 1, name: 'user01' },
            dueDate: '2022-10-24',
            returnHistories: [{ createdAt: '2022-10-20' }],
          },
          {
            id: 2,
            createdAt: '2022-10-01',
            user: {
              id: 2,
              name: 'user02',
            },
            dueDate: '2022-10-08',
            returnHistories: [{ createdAt: '2022-10-30' }],
          },
          {
            id: 3,
            createdAt: '2022-10-01',
            user: { id: 3, name: 'user03' },
            dueDate: '2022-10-15',
            returnHistories: [{ createdAt: '2022-10-25' }],
          },
        ],
      }

      const { getByText, getByTestId } = render(<BookDetail book={returnedBook} />)

      expect(getByText('借りた人')).toBeInTheDocument()
      expect(getByTestId(`returnedDate-${0}`).textContent).toBe('2022/10/01〜2022/10/30')
      expect(getByTestId(`returnedUser-${0}`).textContent).toBe('u')
      expect(getByTestId(`returnedDate-${1}`).textContent).toBe('2022/10/01〜2022/10/25')
      expect(getByTestId(`returnedUser-${1}`).textContent).toBe('u')
      expect(getByTestId(`returnedDate-${2}`).textContent).toBe('2022/10/01〜2022/10/20')
      expect(getByTestId(`returnedUser-${2}`).textContent).toBe('u')
    })

    it('返却済の貸出履歴がない場合、いないことが表示される', () => {
      const { getByText } = render(<BookDetail book={lendableBook} />)

      expect(getByText('借りた人')).toBeInTheDocument()
      expect(getByText('いません')).toBeInTheDocument()
    })
  })
})
