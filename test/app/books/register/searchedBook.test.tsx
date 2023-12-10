import { render } from '@testing-library/react'
import { user1 } from '../../../__utils__/data/user'
import AddBookDiv from '@/app/books/register/addBookDiv'
import RegisterBookDiv from '@/app/books/register/registerBookDiv'
import useSWR from 'swr'

jest.mock('@/app/books/register/addBookDiv')
jest.mock('@/app/books/register/registerBookDiv')
jest.mock('swr')

describe('searched book component', () => {
  ;(AddBookDiv as jest.Mock).mockImplementation(() => {
    return <>add book div component</>
  })
  ;(RegisterBookDiv as jest.Mock).mockImplementation(() => {
    return <>register book div component</>
  })
  const swrMock = useSWR as jest.Mock
  const userId = user1.id
  const isbn = '1234567890123'
  const bookTitle = 'testBook'

  const SearchedBookComponent = require('@/app/books/register/searchedBook').default

  it('書籍情報が表示される', () => {
    swrMock
      .mockReturnValueOnce({
        data: {
          items: [
            {
              volumeInfo: {
                title: bookTitle,
              },
            },
          ],
        },
      })
      .mockReturnValueOnce({ data: { book: {} } })

    const { getByText } = render(<SearchedBookComponent isbn={isbn} userId={userId} />)

    expect(getByText('こちらの本でしょうか？')).toBeInTheDocument()
    expect(getByText('testBook')).toBeInTheDocument()
  })

  it('登録済みの書籍の場合は書籍を追加するためのコンポーネントを表示する', () => {
    const companyBook = { _count: { registrationHistories: 1 } }
    swrMock
      .mockReturnValueOnce({
        data: {
          items: [
            {
              volumeInfo: {
                title: bookTitle,
              },
            },
          ],
        },
      })
      .mockReturnValueOnce({ data: { book: companyBook } })

    render(<SearchedBookComponent isbn={isbn} userId={userId} />)

    expect(AddBookDiv).toBeCalledWith(
      {
        companyBook,
        userId: user1.id,
      },
      {},
    )
    expect(RegisterBookDiv).not.toBeCalled()
  })

  it('登録がない書籍の場合は書籍を新規登録するためのコンポーネントを表示する', () => {
    swrMock
      .mockReturnValueOnce({
        data: {
          items: [
            {
              volumeInfo: {
                title: bookTitle,
              },
            },
          ],
        },
      })
      .mockReturnValueOnce({ data: { book: {} } })

    render(<SearchedBookComponent isbn={isbn} userId={userId} />)

    expect(AddBookDiv).not.toBeCalled()
    expect(RegisterBookDiv).toBeCalledWith(
      {
        title: bookTitle,
        isbn: isbn,
        thumbnailUrl: undefined,
        userId: userId,
      },
      {},
    )
  })

  it('存在しない書籍の場合は書籍が見つからなかった旨のメッセージを表示する', () => {
    swrMock.mockReturnValueOnce({ data: undefined }).mockReturnValueOnce({ data: { book: {} } })

    const { getByText } = render(<SearchedBookComponent isbn={isbn} userId={userId} />)

    expect(getByText('書籍は見つかりませんでした')).toBeInTheDocument()
  })
})
