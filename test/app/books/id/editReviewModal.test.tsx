import { render, screen, fireEvent } from '@testing-library/react'
import EditReviewModal from '@/app/books/[id]/editReviewModal'

describe('EditReviewModal component', () => {
  const onSaveMock = vi.fn()
  const onRequestCloseMock = vi.fn()

  beforeEach(() => {
    onSaveMock.mockClear()
    onRequestCloseMock.mockClear()
  })

  it('renders the modal with the current impression', () => {
    render(
      <EditReviewModal
        isOpen={true}
        onRequestClose={onRequestCloseMock}
        currentImpression="This is a test impression"
        onSave={onSaveMock}
      />
    )

    expect(screen.getByText('感想を編集')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('This is a test impression')
  })

  it('calls onSave with the new impression when the Save button is clicked', () => {
    render(
      <EditReviewModal
        isOpen={true}
        onRequestClose={onRequestCloseMock}
        currentImpression="This is a test impression"
        onSave={onSaveMock}
      />
    )

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Updated impression' } })
    fireEvent.click(screen.getByText('保存'))

    expect(onSaveMock).toHaveBeenCalledWith('Updated impression')
  })

  it('calls onRequestClose when the Cancel button is clicked', () => {
    render(
      <EditReviewModal
        isOpen={true}
        onRequestClose={onRequestCloseMock}
        currentImpression="This is a test impression"
        onSave={onSaveMock}
      />
    )

    fireEvent.click(screen.getByText('キャンセル'))

    expect(onRequestCloseMock).toHaveBeenCalled()
  })

  it('shows an alert if the impression is empty when the Save button is clicked', () => {
    window.alert = vi.fn()

    render(
      <EditReviewModal
        isOpen={true}
        onRequestClose={onRequestCloseMock}
        currentImpression="This is a test impression"
        onSave={onSaveMock}
      />
    )

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } })
    fireEvent.click(screen.getByText('保存'))

    expect(window.alert).toHaveBeenCalledWith('Impression cannot be empty')
    expect(onSaveMock).not.toHaveBeenCalled()
  })

  it('shows an alert if the impression exceeds 500 characters when the Save button is clicked', () => {
    window.alert = vi.fn()
    const longImpression = 'a'.repeat(501)

    render(
      <EditReviewModal
        isOpen={true}
        onRequestClose={onRequestCloseMock}
        currentImpression="This is a test impression"
        onSave={onSaveMock}
      />
    )

    fireEvent.change(screen.getByRole('textbox'), { target: { value: longImpression } })
    fireEvent.click(screen.getByText('保存'))

    expect(window.alert).toHaveBeenCalledWith('Impression cannot exceed 500 characters')
    expect(onSaveMock).not.toHaveBeenCalled()
  })
})
