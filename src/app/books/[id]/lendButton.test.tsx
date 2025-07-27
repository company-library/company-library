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

  const mockLocationStats = new Map([
    [1, { name: '本社', order: 1, totalCount: 5, lendableCount: 3 }],
    [2, { name: '支社', order: 2, totalCount: 3, lendableCount: 2 }],
  ])
  const { lendBookMock } = vi.hoisted(() => {
    return {
      lendBookMock: vi.fn(),
    }
  })
  vi.mock('@/app/books/[id]/actions', () => ({
    lendBook: (bookId: number, userId: string, dueDate: Date, locationId: number) =>
      lendBookMock(bookId, userId, dueDate, locationId),
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
    const { rerender } = render(
      <LendButton
        bookId={bookId}
        userId={userId}
        disabled={true}
        locationStats={mockLocationStats}
      />,
    )

    expect(screen.getByRole('button', { name: '借りる' })).toBeDisabled()

    rerender(
      <LendButton
        bookId={bookId}
        userId={userId}
        disabled={false}
        locationStats={mockLocationStats}
      />,
    )

    expect(screen.getByRole('button', { name: '借りる' })).not.toBeDisabled()
  })

  it('ボタンをクリックすると、返却予定日の初期値を表示したダイアログが表示される', async () => {
    render(
      <LendButton
        bookId={bookId}
        userId={userId}
        disabled={false}
        locationStats={mockLocationStats}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '借りる' }))

    expect(screen.getByRole('heading', { level: 3, name: '借りますか?' })).toBeInTheDocument()
    expect(screen.getByDisplayValue(initialDuDate)).toBeInTheDocument()
  })

  it('ダイアログのOkボタンをクリックすると、貸出処理が実行される', async () => {
    const expectedDueDate = today.plus({ days: 14 })
    render(
      <LendButton
        bookId={bookId}
        userId={userId}
        disabled={false}
        locationStats={mockLocationStats}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '借りる' }))

    // 保管場所を選択
    fireEvent.change(screen.getByLabelText('保管場所を選択してください'), {
      target: { value: '1' },
    })

    fireEvent.change(screen.getByDisplayValue(initialDuDate), {
      target: { value: expectedDueDate.toFormat(dateFormat) },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { level: 3, name: '借りる設定' }),
      ).not.toBeInTheDocument()
    })
    expect(lendBookMock).toBeCalledWith(
      bookId,
      userId,
      dateStringToDate(expectedDueDate.toISODate() ?? ''),
      1,
    )
    expect(refreshMock).toBeCalled()
  })

  it('貸出処理に失敗した場合、エラーメッセージが表示される', async () => {
    lendBookMock.mockResolvedValueOnce(new Error('error occurred'))
    window.alert = vi.fn()

    render(
      <LendButton
        bookId={bookId}
        userId={userId}
        disabled={false}
        locationStats={mockLocationStats}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '借りる' }))

    // 保管場所を選択
    fireEvent.change(screen.getByLabelText('保管場所を選択してください'), {
      target: { value: '1' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(window.alert).toBeCalledWith('貸し出しに失敗しました。もう一度試してみてください。')
    })
    expect(refreshMock).not.toBeCalled()
  })

  it('ダイアログのCancelボタンをクリックすると、貸出処理は実行されない', async () => {
    render(
      <LendButton
        bookId={bookId}
        userId={userId}
        disabled={false}
        locationStats={mockLocationStats}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '借りる' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { level: 3, name: '借りる設定' }),
      ).not.toBeInTheDocument()
      expect(lendBookMock).not.toBeCalled()
    })
  })

  it('保管場所はorder順で表示される', async () => {
    const mockLocationStatsWithDifferentOrder = new Map([
      [3, { name: '支社B', order: 3, totalCount: 2, lendableCount: 1 }],
      [1, { name: '本社', order: 1, totalCount: 5, lendableCount: 3 }],
      [2, { name: '支社A', order: 2, totalCount: 3, lendableCount: 2 }],
    ])

    render(
      <LendButton
        bookId={bookId}
        userId={userId}
        disabled={false}
        locationStats={mockLocationStatsWithDifferentOrder}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '借りる' }))

    const selectElement = screen.getByLabelText('保管場所を選択してください')
    const options = Array.from(selectElement.children).slice(1) as HTMLOptionElement[]

    expect(options[0].textContent).toBe('本社 (3冊利用可能)')
    expect(options[0].value).toBe('1')
    expect(options[1].textContent).toBe('支社A (2冊利用可能)')
    expect(options[1].value).toBe('2')
    expect(options[2].textContent).toBe('支社B (1冊利用可能)')
    expect(options[2].value).toBe('3')
  })
})
