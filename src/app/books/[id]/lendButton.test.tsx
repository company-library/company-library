import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { DateTime } from 'luxon'
import LendButton from '@/app/books/[id]/lendButton'

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
  const { lendBookActionMock, useActionStateMock } = vi.hoisted(() => {
    return {
      lendBookActionMock: vi.fn(),
      useActionStateMock: vi.fn(),
    }
  })

  vi.mock('@/app/books/[id]/actions', () => ({
    lendBookAction: (prevState: { success: boolean; error: string | null }, formData: FormData) =>
      lendBookActionMock(prevState, formData),
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

  vi.mock('react', async (importOriginal) => {
    const actual = (await importOriginal()) as typeof import('react')
    return {
      ...actual,
      useActionState: useActionStateMock,
    }
  })

  HTMLDialogElement.prototype.showModal = vi.fn().mockImplementation(() => {
    const modal = document.getElementsByClassName('modal')
    modal[0].setAttribute('open', 'true')
  })
  HTMLDialogElement.prototype.close = vi.fn().mockImplementation(() => {
    const modal = document.getElementsByClassName('modal')
    modal[0].removeAttribute('open')
  })

  beforeEach(() => {
    vi.clearAllMocks()
    // デフォルトのuseActionStateモック
    useActionStateMock.mockReturnValue([
      { success: false, error: null }, // state
      vi.fn(), // formAction
      false, // isPending
    ])
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
    const mockFormAction = vi.fn()

    // 初期状態のuseActionStateモック（success: falseで開始）
    useActionStateMock.mockReturnValue([
      { success: false, error: null }, // state
      mockFormAction, // formAction
      false, // isPending
    ])

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

    expect(mockFormAction).toHaveBeenCalled()
    const formData = mockFormAction.mock.calls[0][0] as FormData
    expect(formData.get('bookId')).toBe(bookId.toString())
    expect(formData.get('userId')).toBe(userId.toString())
    expect(formData.get('locationId')).toBe('1')
  })

  it('貸出処理に失敗した場合、エラーメッセージが表示される', async () => {
    const mockFormAction = vi.fn()
    window.alert = vi.fn()

    // エラー時のuseActionStateモック
    useActionStateMock.mockReturnValue([
      { success: false, error: '貸し出しに失敗しました。もう一度試して見てください。' }, // state
      mockFormAction, // formAction
      false, // isPending
    ])

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
      expect(window.alert).toBeCalledWith('貸し出しに失敗しました。もう一度試して見てください。')
    })
    expect(refreshMock).not.toBeCalled()
  })

  it('ダイアログのCancelボタンをクリックすると、貸出処理は実行されない', async () => {
    const mockFormAction = vi.fn()

    useActionStateMock.mockReturnValue([
      { success: false, error: null }, // state
      mockFormAction, // formAction
      false, // isPending
    ])

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
      expect(mockFormAction).not.toBeCalled()
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
