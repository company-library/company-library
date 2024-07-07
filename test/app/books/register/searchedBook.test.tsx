import SearchedBook from '@/app/books/register/searchedBook'
import { render } from '@testing-library/react'
import useSWR from 'swr'
import type { Mock } from 'vitest'
import { user1 } from '../../../__utils__/data/user'

describe('searched book component', async () => {
  const swrMock = useSWR as Mock
  const userId = user1.id
  const isbn = '1234567890123'
  const bookTitle = 'testBook'

  vi.mock('swr')
  const { addRegisterBookDivMock } = vi.hoisted(() => {
    return { addRegisterBookDivMock: vi.fn().mockImplementation(() => <>add book div component</>) }
  })
  vi.mock('@/app/books/register/addBookDiv', () => ({
    default: addRegisterBookDivMock,
  }))
  const { registerBookDivMock } = vi.hoisted(() => {
    return {
      registerBookDivMock: vi.fn().mockImplementation(() => <>register book div component</>),
    }
  })
  vi.mock('@/app/books/register/registerBookDiv', () => ({
    default: registerBookDivMock,
  }))

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

    const { getByText } = render(<SearchedBook isbn={isbn} userId={userId} />)

    expect(getByText('こちらの本でしょうか？')).toBeInTheDocument()
    expect(getByText('testBook')).toBeInTheDocument()
    expect(getByText('register book div component')).toBeInTheDocument()
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

    render(<SearchedBook isbn={isbn} userId={userId} />)

    expect(addRegisterBookDivMock).toBeCalledWith(
      {
        companyBook,
        userId: user1.id,
      },
      undefined,
    )
    expect(registerBookDivMock).not.toBeCalled()
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

    render(<SearchedBook isbn={isbn} userId={userId} />)

    expect(addRegisterBookDivMock).not.toBeCalled()
    expect(registerBookDivMock).toBeCalledWith(
      {
        title: bookTitle,
        isbn: isbn,
        thumbnailUrl: undefined,
        userId: userId,
      },
      undefined,
    )
  })

  it('存在しない書籍の場合は書籍が見つからなかった旨のメッセージを表示する', () => {
    swrMock.mockReturnValueOnce({ data: undefined }).mockReturnValueOnce({ data: { book: {} } })

    const { getByText } = render(<SearchedBook isbn={isbn} userId={userId} />)

    expect(getByText('書籍は見つかりませんでした')).toBeInTheDocument()
  })
})
