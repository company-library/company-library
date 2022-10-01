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
})
