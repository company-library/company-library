import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import AddImpressionButton from '@/app/books/[id]/addImpressionButton'
import { book1 } from '../../../__utils__/data/book'

describe('AddImpressionButton component', () => {
  const addImpressionMock = vi.hoisted(() => vi.fn())
  vi.mock(import('@/app/books/[id]/actions'), async (importOriginal) => ({
    ...(await importOriginal()),
    addImpression: addImpressionMock,
  }))

  HTMLDialogElement.prototype.showModal = vi.fn().mockImplementation(() => {
    const modal = document.getElementsByClassName('modal')
    modal[0].setAttribute('open', 'true')
  })
  HTMLDialogElement.prototype.close = vi.fn().mockImplementation(() => {
    const modal = document.getElementsByClassName('modal')
    modal[0].removeAttribute('open')
  })

  it('ボタンをクリックすると、ダイアログが表示される', () => {
    render(<AddImpressionButton bookId={book1.id} />)
    fireEvent.click(screen.getByRole('button', { name: '感想を書く' }))

    expect(screen.getByRole('heading', { level: 3, name: '新規感想' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('感想を書いてください')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Ok' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('ダイアログで感想を書くことができる', async () => {
    render(<AddImpressionButton bookId={book1.id} />)
    fireEvent.click(screen.getByRole('button', { name: '感想を書く' }))
    fireEvent.change(screen.getByPlaceholderText('感想を書いてください'), {
      target: { value: '感想を書いたよ' },
    })

    expect(screen.getByDisplayValue('感想を書いたよ')).toBeInTheDocument()
  })

  it('ダイアログのOkボタンをクリックすると、投稿処理が実行される', async () => {
    addImpressionMock.mockResolvedValueOnce({
      success: true,
      value: { impression: '感想を編集したよ' },
    })

    render(<AddImpressionButton bookId={book1.id} />)
    fireEvent.click(screen.getByRole('button', { name: '感想を書く' }))
    fireEvent.change(screen.getByPlaceholderText('感想を書いてください'), {
      target: { value: '感想を書いたよ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ok' }))

    const formData = new FormData()
    formData.append('impression', '感想を書いたよ')
    await waitFor(() => {
      expect(addImpressionMock).toHaveBeenCalledWith(
        {
          success: false,
          value: { impression: '' },
          apiError: null,
        },
        formData,
        book1.id,
      )
      expect(screen.queryByRole('heading', { level: 3, name: '新規感想' })).not.toBeInTheDocument()
    })
  })

  it('投稿処理でエラーが発生した場合、アラート表示する', async () => {
    addImpressionMock.mockResolvedValueOnce({
      success: false,
      value: { impression: '感想を書いたよ' },
      apiError: new Error('投稿に失敗しました。もう一度試してみてください。'),
    })
    window.alert = vi.fn()

    render(<AddImpressionButton bookId={book1.id} />)
    fireEvent.click(screen.getByRole('button', { name: '感想を書く' }))
    fireEvent.change(screen.getByPlaceholderText('感想を書いてください'), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(window.alert).toBeCalledWith('投稿に失敗しました。もう一度試してみてください。')
    })
  })

  it('ダイアログのCancelボタンをクリックすると、投稿処理は実行されない', async () => {
    render(<AddImpressionButton bookId={book1.id} />)
    fireEvent.click(screen.getByRole('button', { name: '感想を書く' }))
    expect(screen.getByPlaceholderText('感想を書いてください')).toHaveValue('')
    fireEvent.change(screen.getByPlaceholderText('感想を書いてください'), {
      target: { value: '感想を書いたよ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(addImpressionMock).not.toBeCalled()
      expect(screen.queryByRole('heading', { level: 3, name: '新規感想' })).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '感想を書く' }))
    expect(screen.getByPlaceholderText('感想を書いてください')).toHaveValue('感想を書いたよ')
  })
})
