import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import RegisterBookDiv from '@/app/books/register/registerBookDiv'
import { user1 } from '../../../../test/__utils__/data/user'

describe('register book div component', async () => {
  const registerBookActionMock = vi.hoisted(() => vi.fn())
  vi.mock('@/app/books/register/actions', () => ({
    registerBook: registerBookActionMock,
  }))

  // SWRのモック
  vi.mock('swr', () => ({
    default: () => ({
      data: { locations: [{ id: 1, name: 'テスト場所' }] },
      error: null,
    }),
  }))

  it('登録ボタンをクリックすると、server actionが実行される', async () => {
    const title = 'testBook'
    const isbn = '1234567890123'
    const thumbnailUrl = 'https://example.com/test.jpg'
    const userId = user1.id

    render(
      <RegisterBookDiv title={title} isbn={isbn} thumbnailUrl={thumbnailUrl} userId={userId} />,
    )

    expect(registerBookActionMock).not.toBeCalled()

    // 保管場所を選択
    const locationSelect = screen.getByRole('combobox')
    fireEvent.change(locationSelect, { target: { value: '1' } })

    fireEvent.click(screen.getByRole('button', { name: '登録する' }))

    await waitFor(() => {
      expect(registerBookActionMock).toBeCalledTimes(1)
      expect(registerBookActionMock).toHaveBeenCalledWith(title, isbn, thumbnailUrl, 1, userId)
    })
  })
})
