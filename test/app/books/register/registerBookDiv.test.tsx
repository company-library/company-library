import RegisterBookDiv from '@/app/books/register/registerBookDiv'
import { fireEvent, render, screen } from '@testing-library/react'
import { user1 } from '../../../__utils__/data/user'

describe('register book div component', async () => {
  const registerBookActionMock = vi.hoisted(() => vi.fn())
  vi.mock('@/app/books/register/actions', () => ({
    registerBook: { bind: () => () => registerBookActionMock() },
  }))

  it('登録ボタンをクリックすると、server actionが実行される', () => {
    const title = 'testBook'
    const isbn = '1234567890123'
    const thumbnailUrl = 'https://example.com/test.jpg'
    const userId = user1.id

    render(
      <RegisterBookDiv title={title} isbn={isbn} thumbnailUrl={thumbnailUrl} userId={userId} />,
    )

    expect(registerBookActionMock).not.toBeCalled()

    fireEvent.click(screen.getByRole('button', { name: '登録する' }))

    expect(registerBookActionMock).toBeCalledTimes(1)
  })
})
