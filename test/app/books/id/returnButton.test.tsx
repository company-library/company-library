import { fireEvent, screen, render, waitFor } from '@testing-library/react'
import ReturnButton from '@/app/books/[id]/returnButton'

// TransitionとDialogを使用するコンポーネントの場合に必要なモック
const intersectionObserverMock = () => ({
  observe() {},
  disconnect() {},
})
window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

const returnBookMock = jest.fn()
jest.mock('@/app/books/[id]/actions', () => ({
  __esModule: true,
  returnBook: (lendingHistoryId: number) => returnBookMock(lendingHistoryId),
  returnBookWithImpression: (args: unknown) => returnBookMock(args),
}))

const refreshMock = jest.fn()
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => {
    return { refresh: refreshMock }
  },
}))

describe('returnButton component', () => {
  const bookId = 1
  const userId = 2
  const lendingHistoryId = 10

  it('propsのdisabledがtrueの場合、無効化して表示される', () => {
    const { getByRole, rerender } = render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={true}
      />,
    )

    expect(getByRole('button', { name: '返却する' })).toBeDisabled()

    rerender(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
      />,
    )

    expect(getByRole('button', { name: '返却する' })).not.toBeDisabled()
  })

  it('ボタンをクリックすると、ダイアログが表示される', () => {
    const { getByRole, getByText, getByPlaceholderText } = render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
      />,
    )
    fireEvent.click(getByRole('button', { name: '返却する' }))

    expect(getByText('返却しますか？')).toBeInTheDocument()
    expect(getByPlaceholderText('感想を書いてください')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Ok' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('ダイアログで感想を入力することができる', async () => {
    const { getByRole, getByPlaceholderText, getByDisplayValue } = render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
      />,
    )
    fireEvent.click(getByRole('button', { name: '返却する' }))
    fireEvent.change(getByPlaceholderText('感想を書いてください'), {
      target: { value: '感想を書いたよ' },
    })

    expect(getByDisplayValue('感想を書いたよ')).toBeInTheDocument()
  })

  it('ダイアログのOkボタンをクリックすると、返却処理が実行され、リロードされる', async () => {
    const { getByRole, queryByText } = render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
      />,
    )
    fireEvent.click(getByRole('button', { name: '返却する' }))
    fireEvent.click(getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(returnBookMock).toHaveBeenCalledWith(lendingHistoryId)
      expect(queryByText('返却しますか？')).not.toBeInTheDocument()
      expect(refreshMock).toBeCalled()
    })
  })

  it('感想が入力された場合は、感想付きの返却処理を実行する', async () => {
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
      expect(screen.queryByText('返却しますか？')).not.toBeInTheDocument()
      expect(refreshMock).toBeCalled()
    })
  })

  it('返却処理でエラーが発生した場合、アラート表示する', async () => {
    returnBookMock.mockReturnValueOnce(new Error('error occurred!'))
    window.alert = jest.fn()

    const { getByRole, queryByText } = render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
      />,
    )
    fireEvent.click(getByRole('button', { name: '返却する' }))
    fireEvent.click(getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(returnBookMock).toBeCalled()
      expect(window.alert).toBeCalledWith('返却に失敗しました。もう一度試してみてください。')
      expect(queryByText('返却しますか？')).not.toBeInTheDocument()
      expect(refreshMock).toBeCalled()
    })
  })

  it('ダイアログのCancelボタンをクリックすると、返却処理は実行されない', async () => {
    const { getByRole, queryByText } = render(
      <ReturnButton
        bookId={bookId}
        userId={userId}
        lendingHistoryId={lendingHistoryId}
        disabled={false}
      />,
    )
    fireEvent.click(getByRole('button', { name: '返却する' }))
    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(returnBookMock).not.toBeCalled()
      expect(queryByText('返却しますか？')).not.toBeInTheDocument()
    })
  })
})
