import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ReturnButton from '@/app/books/[id]/returnButton'

describe('returnButton component', () => {
  const bookId = 1
  const userId = 2
  const lendingHistoryId = 10

  const { returnBookActionMock, useActionStateMock } = vi.hoisted(() => {
    return {
      returnBookActionMock: vi.fn(),
      useActionStateMock: vi.fn(),
    }
  })

  vi.mock('@/app/books/[id]/actions', () => ({
    returnBookAction: (prevState: { success: boolean; error: string | null }, formData: FormData) =>
      returnBookActionMock(prevState, formData),
  }))

  const refreshMock = vi.hoisted(() => vi.fn())
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

  it('propsのdisabledがtrueの場合、無効化して表示される', () => {
    const { rerender } = render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={true}
        locationName="1階 エントランス"
      />,
    )

    expect(screen.getByRole('button', { name: '返却する' })).toBeDisabled()

    rerender(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
        locationName="1階 エントランス"
      />,
    )

    expect(screen.getByRole('button', { name: '返却する' })).not.toBeDisabled()
  })

  it('ボタンをクリックすると、ダイアログが表示される', () => {
    const locationName = '1階 エントランス'
    render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
        locationName={locationName}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '返却する' }))

    expect(screen.getByRole('heading', { level: 3, name: '返却しますか?' })).toBeInTheDocument()
    expect(screen.getByText(`返却先: ${locationName}`)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('感想を書いてください')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ok' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('ダイアログで感想を入力することができる', async () => {
    render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
        locationName="1階 エントランス"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '返却する' }))
    fireEvent.change(screen.getByPlaceholderText('感想を書いてください'), {
      target: { value: '感想を書いたよ' },
    })

    expect(screen.getByDisplayValue('感想を書いたよ')).toBeInTheDocument()
  })

  it('ダイアログのOkボタンをクリックすると、返却処理が実行され、リロードされる', async () => {
    const mockFormAction = vi.fn()

    // 初期状態のuseActionStateモック
    useActionStateMock.mockReturnValue([
      { success: false, error: null }, // state
      mockFormAction, // formAction
      false, // isPending
    ])

    render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
        locationName="1階 エントランス"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '返却する' }))
    fireEvent.change(screen.getByPlaceholderText('感想を書いてください'), {
      target: { value: '感想を書いたよ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ok' }))

    expect(mockFormAction).toHaveBeenCalled()
    const formData = mockFormAction.mock.calls[0][0] as FormData
    expect(formData.get('bookId')).toBe(bookId.toString())
    expect(formData.get('userId')).toBe(userId.toString())
    expect(formData.get('lendingHistoryId')).toBe(lendingHistoryId.toString())
    expect(formData.get('impression')).toBe('感想を書いたよ')
  })

  it('返却処理でエラーが発生した場合、アラート表示する', async () => {
    const mockFormAction = vi.fn()
    window.alert = vi.fn()

    // エラー時のuseActionStateモック
    useActionStateMock.mockReturnValue([
      { success: false, error: '返却に失敗しました。もう一度試して見てください。' }, // state
      mockFormAction, // formAction
      false, // isPending
    ])

    render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
        locationName="1階 エントランス"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '返却する' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(window.alert).toBeCalledWith('返却に失敗しました。もう一度試して見てください。')
    })
    expect(refreshMock).not.toBeCalled()
  })

  it('ダイアログのCancelボタンをクリックすると、返却処理は実行されない', async () => {
    const mockFormAction = vi.fn()

    useActionStateMock.mockReturnValue([
      { success: false, error: null }, // state
      mockFormAction, // formAction
      false, // isPending
    ])

    render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
        locationName="1階 エントランス"
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '返却する' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(mockFormAction).not.toBeCalled()
      expect(
        screen.queryByRole('heading', { level: 3, name: '返却しますか？' }),
      ).not.toBeInTheDocument()
    })
  })

  it('locationNameがundefinedの場合、返却先は表示されない', () => {
    render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
        locationName={undefined}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '返却する' }))

    expect(screen.queryByText(/返却先:/)).not.toBeInTheDocument()
  })
})
