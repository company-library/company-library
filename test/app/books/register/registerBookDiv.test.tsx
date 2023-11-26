import { fireEvent, render } from '@testing-library/react'
import { user1 } from '../../../__utils__/data/user'

const registerBookActionMock = jest.fn()
jest.mock('@/app/books/register/actions', () => ({
  __esModule: true,
  registerBook: { bind: () => () => registerBookActionMock() },
}))

describe('register book div component', () => {
  const RegisterBookDivComponent = require('@/app/books/register/registerBookDiv').default

  it('登録ボタンをクリックすると、server actionが実行される', () => {
    const title = 'testBook'
    const isbn = '1234567890123'
    const thumbnailUrl = 'https://example.com/test.jpg'
    const userId = user1.id

    const { getByText } = render(
      <RegisterBookDivComponent
        title={title}
        isbn={isbn}
        thumbnailUrl={thumbnailUrl}
        userId={userId}
      />,
    )

    expect(registerBookActionMock).not.toBeCalled()

    fireEvent.click(getByText('登録する'))

    expect(registerBookActionMock).toBeCalledTimes(1)
  })
})
