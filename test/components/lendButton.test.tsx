import LendButton from '@/components/lendButton'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'

// TransitionとDialogを使用するコンポーネントの場合に必要なモック
const intersectionObserverMock = () => ({
  observe() {},
  disconnect() {},
})
window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

describe('LendButton component', () => {
  const bookId = 1

  const dateFormat = 'yyyy-MM-dd'
  const today = DateTime.local().setZone('Asia/Tokyo')
  const expectedInitialDuDate = today.plus({ days: 7 }).toFormat(dateFormat)

  const lendMock = jest.fn()
  const handleDueDateMock = jest.fn()
  const useLendMock = jest.spyOn(require('@/hooks/useLend'), 'useLend').mockReturnValue({
    lend: lendMock,
    dueDate: today.toFormat(dateFormat),
    handleDueDate: handleDueDateMock,
  })

  it('propsのdisabledがtrueの場合、無効化して表示される', async () => {
    const { getByRole, rerender } = render(<LendButton bookId={bookId} disabled={true} />)

    expect(getByRole('button', { name: '借りる' })).toBeDisabled()
    expect(useLendMock).toBeCalledWith(bookId, expectedInitialDuDate)

    rerender(<LendButton bookId={bookId} disabled={false} />)

    expect(getByRole('button', { name: '借りる' })).not.toBeDisabled()
  })

  it('ボタンをクリックすると、返却予定日の初期値を表示したダイアログが表示される', async () => {
    const { getByRole, getByText, getByDisplayValue } = render(
      <LendButton bookId={bookId} disabled={false} />,
    )
    fireEvent.click(getByRole('button', { name: '借りる' }))

    expect(getByText('何日まで借りますか？')).toBeInTheDocument()
    expect(getByDisplayValue(today.toFormat(dateFormat))).toBeInTheDocument()
  })

  it('ダイアログの返却予定日を変更すると、変更処理が実行される', async () => {
    const { getByRole, getByDisplayValue } = render(<LendButton bookId={bookId} disabled={false} />)
    fireEvent.click(getByRole('button', { name: '借りる' }))
    fireEvent.change(getByDisplayValue(today.toFormat(dateFormat)), {
      target: { value: today.plus({ days: 14 }).toFormat(dateFormat) },
    })

    expect(handleDueDateMock).toBeCalled()
  })

  it('ダイアログのOkボタンをクリックすると、貸出処理が実行される', async () => {
    const { getByRole, queryByText } = render(<LendButton bookId={bookId} disabled={false} />)
    fireEvent.click(getByRole('button', { name: '借りる' }))
    fireEvent.click(getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(queryByText('何日まで借りますか？')).not.toBeInTheDocument()
      expect(lendMock).toBeCalled()
    })
  })

  it('ダイアログのCancelボタンをクリックすると、貸出処理は実行されない', async () => {
    const { getByRole, queryByText } = render(<LendButton bookId={bookId} disabled={false} />)
    fireEvent.click(getByRole('button', { name: '借りる' }))
    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(queryByText('何日まで借りますか？')).not.toBeInTheDocument()
      expect(lendMock).not.toBeCalled()
    })
  })
})
