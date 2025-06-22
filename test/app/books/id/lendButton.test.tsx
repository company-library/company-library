import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'
import LendButton from '@/app/books/[id]/lendButton'
import { dateStringToDate } from '@/libs/luxon/utils'

describe('LendButton component', () => {
  const bookId = 1
  const userId = 2

  const dateFormat = 'yyyy-MM-dd'
  const today = DateTime.local().setZone('Asia/Tokyo')
  const initialDuDate = today.plus({ days: 7 }).toFormat(dateFormat)
  const { lendBookMock } = vi.hoisted(() => {
    return {
      lendBookMock: vi.fn(),
    }
  })
  vi.mock('@/app/books/[id]/actions', () => ({
    lendBook: (bookId: string, userId: string, dueDate: Date) =>
      lendBookMock(bookId, userId, dueDate),
  }))

  const { refreshMock } = vi.hoisted(() => {
    return {
      refreshMock: vi.fn(),
    }
  })
  vi.mock('next/navigation', () => ({
    useRouter: () => {
      return { refresh: refreshMock }
    },
  }))

  HTMLDialogElement.prototype.showModal = vi.fn().mockImplementation(() => {
    const modal = document.getElementsByClassName('modal')
    modal[0].setAttribute('open', 'true')
  })
  HTMLDialogElement.prototype.close = vi.fn().mockImplementation(() => {
    const modal = document.getElementsByClassName('modal')
    modal[0].removeAttribute('open')
  })

  it('propsのdisabledがtrueの場合、無効化して表示される', async () => {
    const { rerender } = render(<LendButton bookId={bookId} userId={userId} disabled={true} />)

    expect(screen.getByRole('button', { name: '借りる' })).toBeDisabled()

    rerender(<LendButton bookId={bookId} userId={userId} disabled={false} />)

    expect(screen.getByRole('button', { name: '借りる' })).not.toBeDisabled()
  })

  it('ボタンをクリックすると、返却予定日の初期値を表示したダイアログが表示される', async () => {
    render(<LendButton bookId={bookId} userId={userId} disabled={false} />)
    fireEvent.click(screen.getByRole('button', { name: '借りる' }))

    expect(
      screen.getByRole('heading', { level: 3, name: '何日まで借りますか？' }),
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue(initialDuDate)).toBeInTheDocument()
  })

  it('ダイアログのOkボタンをクリックすると、貸出処理が実行される', async () => {
    const expectedDueDate = today.plus({ days: 14 })
    render(<LendButton bookId={bookId} userId={userId} disabled={false} />)
    fireEvent.click(screen.getByRole('button', { name: '借りる' }))

    fireEvent.change(screen.getByDisplayValue(initialDuDate), {
      target: { value: expectedDueDate.toFormat(dateFormat) },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { level: 3, name: '何日まで借りますか？' }),
      ).not.toBeInTheDocument()
    })
    expect(lendBookMock).toBeCalledWith(
      bookId,
      userId,
      dateStringToDate(expectedDueDate.toISODate() ?? ''),
    )
    expect(refreshMock).toBeCalled()
  })

  it('貸出処理に失敗した場合、エラーメッセージが表示される', async () => {
    lendBookMock.mockResolvedValueOnce(new Error('error occurred'))
    window.alert = vi.fn()

    render(<LendButton bookId={bookId} userId={userId} disabled={false} />)

    fireEvent.click(screen.getByRole('button', { name: '借りる' }))

    fireEvent.click(screen.getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(window.alert).toBeCalledWith('貸し出しに失敗しました。もう一度試してみてください。')
    })
    expect(refreshMock).not.toBeCalled()
  })

  it('ダイアログのCancelボタンをクリックすると、貸出処理は実行されない', async () => {
    render(<LendButton bookId={bookId} userId={userId} disabled={false} />)
    fireEvent.click(screen.getByRole('button', { name: '借りる' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { level: 3, name: '何日まで借りますか？' }),
      ).not.toBeInTheDocument()
      expect(lendBookMock).not.toBeCalled()
    })
  })
})
