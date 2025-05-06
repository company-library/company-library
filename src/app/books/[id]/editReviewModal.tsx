import { useState } from 'react'
import Modal from 'react-modal'

type EditReviewModalProps = {
  isOpen: boolean
  onRequestClose: () => void
  currentImpression: string
  onSave: (newImpression: string) => void
}

const EditReviewModal = ({ isOpen, onRequestClose, currentImpression, onSave }: EditReviewModalProps) => {
  const [newImpression, setNewImpression] = useState(currentImpression)

  const handleSaveClick = () => {
    // Validation
    if (newImpression.trim() === '') {
      alert('Impression cannot be empty')
      return
    }
    if (newImpression.length > 500) {
      alert('Impression cannot exceed 500 characters')
      return
    }

    onSave(newImpression)
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2>感想を編集</h2>
      <textarea
        value={newImpression}
        onChange={(e) => setNewImpression(e.target.value)}
        rows={5}
        className="w-full p-2 border border-gray-300 rounded"
      />
      <button onClick={handleSaveClick} className="bg-blue-500 text-white px-4 py-2 rounded">
        保存
      </button>
      <button onClick={onRequestClose} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded">
        キャンセル
      </button>
    </Modal>
  )
}

export default EditReviewModal
