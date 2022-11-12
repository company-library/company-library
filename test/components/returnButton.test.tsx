import { fireEvent, render, waitFor } from '@testing-library/react'
import ReturnButton from '@/components/returnButton'

// TransitionとDialogを使用するコンポーネントの場合に必要なモック
const intersectionObserverMock = () => ({
  observe() {},
  disconnect() {},
})
window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

describe('returnButton component', () => {
  const lendingHistoryId = 10

  const returnBookMock = jest.fn()
  jest.spyOn(require('@/hooks/useReturn'), 'useReturn').mockReturnValue({
    returnBook: returnBookMock,
  })
  const reloadMock = jest.fn()
  jest.spyOn(require('next/router'), 'useRouter').mockReturnValue({ reload: reloadMock })

  it('propsのdisabledがtrueの場合、無効化して表示される', () => {
    const { getByRole, rerender } = render(
      <ReturnButton lendingHistoryId={lendingHistoryId} disabled={true} />,
    )

    expect(getByRole('button', { name: '返却する' })).toBeDisabled()

    rerender(<ReturnButton lendingHistoryId={lendingHistoryId} disabled={false} />)

    expect(getByRole('button', { name: '返却する' })).not.toBeDisabled()
  })

  it('ボタンをクリックすると、ダイアログが表示される', () => {
    const { getByRole, getByText, getByPlaceholderText } = render(
      <ReturnButton lendingHistoryId={lendingHistoryId} disabled={false} />,
    )
    fireEvent.click(getByRole('button', { name: '返却する' }))

    expect(getByText('返却しますか？')).toBeInTheDocument()
    expect(getByPlaceholderText('感想を書いてください')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Ok' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('ダイアログで感想を入力することができる', async () => {
    const { getByRole, getByPlaceholderText, getByDisplayValue } = render(
      <ReturnButton lendingHistoryId={lendingHistoryId} disabled={false} />,
    )
    fireEvent.click(getByRole('button', { name: '返却する' }))
    fireEvent.change(getByPlaceholderText('感想を書いてください'), {
      target: { value: '感想を書いたよ' },
    })

    expect(getByDisplayValue('感想を書いたよ')).toBeInTheDocument()
  })

  it('ダイアログのOkボタンをクリックすると、返却処理が実行され、リロードされる', async () => {
    const { getByRole, queryByText } = render(
      <ReturnButton lendingHistoryId={lendingHistoryId} disabled={false} />,
    )
    fireEvent.click(getByRole('button', { name: '返却する' }))
    fireEvent.click(getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(returnBookMock).toBeCalled()
      expect(queryByText('返却しますか？')).not.toBeInTheDocument()
      expect(reloadMock).toBeCalled()
    })
  })

  it('返却処理でエラーが発生した場合、アラート表示する', async () => {
    returnBookMock.mockReturnValueOnce(new Error('error occurred!'))
    window.alert = jest.fn()

    const { getByRole, queryByText } = render(
      <ReturnButton lendingHistoryId={lendingHistoryId} disabled={false} />,
    )
    fireEvent.click(getByRole('button', { name: '返却する' }))
    fireEvent.click(getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(returnBookMock).toBeCalled()
      expect(window.alert).toBeCalledWith('返却に失敗しました。もう一度試してみてください。')
      expect(queryByText('返却しますか？')).not.toBeInTheDocument()
      expect(reloadMock).toBeCalled()
    })
  })

  it('ダイアログのCancelボタンをクリックすると、返却処理は実行されない', async () => {
    const { getByRole, queryByText } = render(
      <ReturnButton lendingHistoryId={lendingHistoryId} disabled={false} />,
    )
    fireEvent.click(getByRole('button', { name: '返却する' }))
    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(returnBookMock).not.toBeCalled()
      expect(queryByText('返却しますか？')).not.toBeInTheDocument()
    })
  })
})
