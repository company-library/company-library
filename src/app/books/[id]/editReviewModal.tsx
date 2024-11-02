import { useState } from 'react'
import Modal from 'react-modal'

type EditReviewModalProps = {
  isOpen: boolean
  onClose: () => void
  impression: {
    id: number
    impression: string
  }
}

const EditReviewModal = ({ isOpen, onClose, impression }: EditReviewModalProps) => {
  const [reviewText, setReviewText] = useState(impression.impression)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // Save changes logic here
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Edit Review Modal">
      <h2>感想を編集</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value)}
          rows={5}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
          保存
        </button>
      </form>
    </Modal>
  )
}

export default EditReviewModal
