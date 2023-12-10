import LendButton from '@/app/books/[id]/lendButton'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'
import { dateStringToDate } from '@/libs/luxon/utils'

// TransitionとDialogを使用するコンポーネントの場合に必要なモック
const intersectionObserverMock = () => ({
  observe() {},
  disconnect() {},
})
window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

const dateFormat = 'yyyy-MM-dd'
const today = DateTime.local().setZone('Asia/Tokyo')
const initialDuDate = today.plus({ days: 7 }).toFormat(dateFormat)
const lendBookMock = jest.fn()
jest.mock('@/app/books/[id]/actions', () => ({
  __esModule: true,
  lendBook: (bookId: string, userId: string, dueDate: Date) =>
    lendBookMock(bookId, userId, dueDate),
}))

describe('LendButton component', () => {
  const bookId = 1
  const userId = 2

  it('propsのdisabledがtrueの場合、無効化して表示される', async () => {
    const { getByRole, rerender } = render(
      <LendButton bookId={bookId} userId={userId} disabled={true} />,
    )

    expect(getByRole('button', { name: '借りる' })).toBeDisabled()

    rerender(<LendButton bookId={bookId} userId={userId} disabled={false} />)

    expect(getByRole('button', { name: '借りる' })).not.toBeDisabled()
  })

  it('ボタンをクリックすると、返却予定日の初期値を表示したダイアログが表示される', async () => {
    const { getByRole, getByText, getByDisplayValue } = render(
      <LendButton bookId={bookId} userId={userId} disabled={false} />,
    )
    fireEvent.click(getByRole('button', { name: '借りる' }))

    expect(getByText('何日まで借りますか？')).toBeInTheDocument()
    expect(getByDisplayValue(initialDuDate)).toBeInTheDocument()
  })

  it('ダイアログのOkボタンをクリックすると、貸出処理が実行される', async () => {
    const expectedDueDate = today.plus({ days: 14 })
    const { getByRole, queryByText, getByDisplayValue } = render(
      <LendButton bookId={bookId} userId={userId} disabled={false} />,
    )
    fireEvent.click(getByRole('button', { name: '借りる' }))

    fireEvent.change(getByDisplayValue(initialDuDate), {
      target: { value: expectedDueDate.toFormat(dateFormat) },
    })

    fireEvent.click(getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(queryByText('何日まで借りますか？')).not.toBeInTheDocument()
      expect(lendBookMock).toBeCalledWith(
        bookId,
        userId,
        dateStringToDate(expectedDueDate.toISODate()),
      )
    })
  })

  it('ダイアログのCancelボタンをクリックすると、貸出処理は実行されない', async () => {
    const { getByRole, queryByText } = render(
      <LendButton bookId={bookId} userId={userId} disabled={false} />,
    )
    fireEvent.click(getByRole('button', { name: '借りる' }))
    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(queryByText('何日まで借りますか？')).not.toBeInTheDocument()
      expect(lendBookMock).not.toBeCalled()
    })
  })
})
