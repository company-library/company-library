import { fireEvent, render, waitFor } from '@testing-library/react'
import AddBookDiv from '@/app/books/register/addBookDiv'
import { user1 } from '../../../__utils__/data/user'

describe('add book div component', async () => {
  const { addBookActionMock } = vi.hoisted(() => {
    return { addBookActionMock: vi.fn() }
  })
  vi.mock('@/app/books/register/actions', () => ({
    addBook: addBookActionMock,
  }))

  // SWRのモック
  vi.mock('swr', () => ({
    default: () => ({
      data: { locations: [{ id: 1, name: 'テスト場所' }] },
      error: null,
    }),
  }))

  it('追加ボタンをクリックすると、server actionが実行される', async () => {
    const companyBook = { id: 1, _count: { registrationHistories: 2 } }
    const userId = user1.id
    const { getByRole, getByText } = render(
      <AddBookDiv companyBook={companyBook} userId={userId} />,
    )

    expect(getByText(/現在の登録冊数：2/)).toBeInTheDocument()
    expect(addBookActionMock).not.toBeCalled()

    // 保管場所を選択
    const locationSelect = getByRole('combobox')
    fireEvent.change(locationSelect, { target: { value: '1' } })

    fireEvent.click(getByRole('button', { name: '追加する' }))

    await waitFor(() => {
      expect(addBookActionMock).toBeCalledTimes(1)
      expect(addBookActionMock).toHaveBeenCalledWith(1, userId, 1)
    })
  })
})
