import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import EditImpressionButton from '@/app/books/[id]/editImpressionButton'

describe('editImpressionButton component', () => {
  const impression = {
    id: 2,
    impression: '興味深い本でした',
    createdAt: new Date('2022-11-01T10:00:00+09:00'),
    updatedAt: new Date('2022-11-01T10:00:00+09:00'),
    user: { id: 2, name: 'user02' },
  }

  const editImpressionMock = vi.hoisted(() => vi.fn())
  vi.mock(import('@/app/books/[id]/actions'), async (importOriginal) => ({
    ...(await importOriginal()),
    editImpression: editImpressionMock,
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

  it('ボタンをクリックすると、ダイアログが表示される', () => {
    render(<EditImpressionButton impression={impression} />)
    fireEvent.click(screen.getByRole('button', { name: '感想を編集' }))

    expect(screen.getByRole('heading', { level: 3, name: '感想を編集' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('感想を書いてください')).toHaveValue(impression.impression)
    expect(screen.getByRole('button', { name: 'Ok' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('ダイアログで感想を編集することができる', async () => {
    render(<EditImpressionButton impression={impression} />)
    fireEvent.click(screen.getByRole('button', { name: '感想を編集' }))
    fireEvent.change(screen.getByPlaceholderText('感想を書いてください'), {
      target: { value: '感想を編集したよ' },
    })

    expect(screen.getByDisplayValue('感想を編集したよ')).toBeInTheDocument()
  })

  it('ダイアログのOkボタンをクリックすると、編集処理が実行され、リロードされる', async () => {
    render(<EditImpressionButton impression={impression} />)
    fireEvent.click(screen.getByRole('button', { name: '感想を編集' }))
    fireEvent.change(screen.getByPlaceholderText('感想を書いてください'), {
      target: { value: '感想を編集したよ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(editImpressionMock).toHaveBeenCalledWith({
        impressionId: impression.id,
        editedImpression: '感想を編集したよ',
      })
      expect(
        screen.queryByRole('heading', { level: 3, name: '感想を編集' }),
      ).not.toBeInTheDocument()
      expect(refreshMock).toBeCalled()
    })
  })

  it('編集処理でエラーが発生した場合、アラート表示する', async () => {
    editImpressionMock.mockResolvedValueOnce(new Error('error occurred!'))
    window.alert = vi.fn()

    render(<EditImpressionButton impression={impression} />)
    fireEvent.click(screen.getByRole('button', { name: '感想を編集' }))
    fireEvent.change(screen.getByPlaceholderText('感想を書いてください'), {
      target: { value: '感想を編集したよ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ok' }))

    await waitFor(() => {
      expect(window.alert).toBeCalledWith('編集に失敗しました。もう一度試してみてください。')
    })
    expect(refreshMock).toBeCalled()
  })

  it('ダイアログのCancelボタンをクリックすると、返却処理は実行されない', async () => {
    render(<EditImpressionButton impression={impression} />)
    fireEvent.click(screen.getByRole('button', { name: '感想を編集' }))
    expect(screen.getByPlaceholderText('感想を書いてください')).toHaveValue(impression.impression)
    fireEvent.change(screen.getByPlaceholderText('感想を書いてください'), {
      target: { value: '感想を編集したよ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(editImpressionMock).not.toBeCalled()
      expect(
        screen.queryByRole('heading', { level: 3, name: '感想を編集' }),
      ).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '感想を編集' }))
    expect(screen.getByPlaceholderText('感想を書いてください')).toHaveValue(impression.impression)
  })
})
