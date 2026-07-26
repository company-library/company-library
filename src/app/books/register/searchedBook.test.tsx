import { render, screen } from '@testing-library/react'
import useSWR from 'swr'
import type { Mock } from 'vitest'
import SearchedBook from '@/app/books/register/searchedBook'
import { user1 } from '../../../../test/__utils__/data/user'

describe('searched book component', async () => {
  const swrMock = useSWR as Mock
  const userId = user1.id
  const isbn = '1234567890123'
  const bookTitle = 'testBook'
  const bookDescription = 'テスト書籍の概要'

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

  const companyBook = { title: bookTitle, _count: { registrationHistories: 1 } }

  it.each([
    {
      testcase: 'Google Books',
      google: { items: [{ volumeInfo: { title: bookTitle } }] },
      openbd: [null],
      registered: { book: {} },
    },
    {
      testcase: 'OpenBD',
      google: undefined,
      openbd: [{ summary: { title: bookTitle } }],
      registered: { book: {} },
    },
    {
      testcase: '登録済書籍',
      google: undefined,
      openbd: [null],
      registered: { book: companyBook },
    },
  ])('$testcaseから取得した書籍情報が表示される', ({ google, openbd, registered }) => {
    swrMock
      .mockReturnValueOnce({ data: google })
      .mockReturnValueOnce({ data: openbd })
      .mockReturnValueOnce({ data: registered })

    render(<SearchedBook isbn={isbn} userId={userId} />)

    expect(screen.getByText('こちらの本でしょうか？')).toBeInTheDocument()
    expect(screen.getByText('testBook')).toBeInTheDocument()
  })

  it('登録済みの書籍の場合は書籍を追加するためのコンポーネントを表示する', () => {
    const companyBook = { title: bookTitle, _count: { registrationHistories: 1 } }
    swrMock
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: { book: companyBook } })

    render(<SearchedBook isbn={isbn} userId={userId} />)

    expect(screen.getByText('add book div component')).toBeInTheDocument()
    expect(addRegisterBookDivMock).toBeCalledWith(
      {
        companyBook,
        userId: user1.id,
      },
      undefined,
    )
    expect(registerBookDivMock).not.toBeCalled()
  })

  it.each([
    {
      testcase: 'Google Books',
      google: { items: [{ volumeInfo: { title: bookTitle, description: bookDescription } }] },
      openbd: [null],
      expectedDescription: bookDescription,
    },
    {
      testcase: 'OpenBD',
      google: undefined,
      openbd: [{ summary: { title: bookTitle } }],
      expectedDescription: '',
    },
  ])(
    '登録がない書籍の場合は書籍を新規登録するためのコンポーネントを表示する($testcase)',
    ({ google, openbd, expectedDescription }) => {
      swrMock
        .mockReturnValueOnce({ data: google })
        .mockReturnValueOnce({ data: openbd })
        .mockReturnValueOnce({ data: { book: {} } })

      render(<SearchedBook isbn={isbn} userId={userId} />)

      expect(screen.getByText('register book div component')).toBeInTheDocument()
      expect(addRegisterBookDivMock).not.toBeCalled()
      expect(registerBookDivMock).toBeCalledWith(
        {
          title: bookTitle,
          description: expectedDescription,
          isbn: isbn,
          thumbnailUrl: undefined,
          userId: userId,
        },
        undefined,
      )
    },
  )

  it('存在しない書籍の場合は書籍が見つからなかった旨のメッセージを表示する', () => {
    swrMock
      .mockReturnValueOnce({ data: undefined })
      .mockReturnValueOnce({ data: [null] })
      .mockReturnValueOnce({ data: { book: {} } })

    render(<SearchedBook isbn={isbn} userId={userId} />)

    expect(screen.getByText('書籍は見つかりませんでした')).toBeInTheDocument()
  })
})
