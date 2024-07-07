import ReturnButton from '@/app/books/[id]/returnButton'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

describe('returnButton component', () => {
  const bookId = 1
  const userId = 2
  const lendingHistoryId = 10

  const returnBookMock = vi.hoisted(() => vi.fn())
  vi.mock('@/app/books/[id]/actions', () => ({
    returnBook: (lendingHistoryId: number) => returnBookMock(lendingHistoryId),
  }))

  const refreshMock = vi.hoisted(() => vi.fn())
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

  it('propsのdisabledがtrueの場合、無効化して表示される', () => {
    const { rerender } = render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={true}
      />,
    )

    expect(screen.getByRole('button', { name: '返却する' })).toBeDisabled()

    rerender(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
      />,
    )

    expect(screen.getByRole('button', { name: '返却する' })).not.toBeDisabled()
  })

  it('ボタンをクリックすると、ダイアログが表示される', () => {
    render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '返却する' }))

    expect(screen.getByRole('heading', { level: 3, name: '返却しますか？' })).toBeInTheDocument()
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
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '返却する' }))
    fireEvent.change(screen.getByPlaceholderText('感想を書いてください'), {
      target: { value: '感想を書いたよ' },
    })

    expect(screen.getByDisplayValue('感想を書いたよ')).toBeInTheDocument()
  })

  it('ダイアログのOkボタンをクリックすると、返却処理が実行され、リロードされる', async () => {
    render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '返却する' }))
    fireEvent.change(screen.getByPlaceholderText('感想を書いてください'), {
      target: { value: '感想を書いたよ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(returnBookMock).toHaveBeenCalledWith({
        bookId,
        userId,
        lendingHistoryId,
        impression: '感想を書いたよ',
      })
      expect(
        screen.queryByRole('heading', { level: 3, name: '返却しますか？' }),
      ).not.toBeInTheDocument()
      expect(refreshMock).toBeCalled()
    })
  })

  it('返却処理でエラーが発生した場合、アラート表示する', async () => {
    returnBookMock.mockResolvedValueOnce(new Error('error occurred!'))
    window.alert = vi.fn()

    render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '返却する' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(window.alert).toBeCalledWith('返却に失敗しました。もう一度試してみてください。')
    })
    expect(refreshMock).not.toBeCalled()
  })

  it('ダイアログのCancelボタンをクリックすると、返却処理は実行されない', async () => {
    render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '返却する' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(returnBookMock).not.toBeCalled()
      expect(
        screen.queryByRole('heading', { level: 3, name: '返却しますか？' }),
      ).not.toBeInTheDocument()
    })
  })
})
