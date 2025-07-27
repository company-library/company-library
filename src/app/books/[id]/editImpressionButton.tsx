'use client'

import { useRouter } from 'next/navigation'
import { type ChangeEvent, type FC, startTransition, useRef, useState } from 'react'
import { editImpression } from '@/app/books/[id]/actions'

type Props = {
  impression: {
    id: number
    impression: string
  }
}

const EditImpressionButton: FC<Props> = ({ impression }) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openModal = () => dialogRef.current?.showModal()
  const closeModal = () => dialogRef.current?.close()

  const [impressionText, setImpressionText] = useState(impression.impression)
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setImpressionText(e.target.value)
  }
  const canEdit = impressionText.length > 0 && impressionText !== impression.impression

  const handleCancel = () => {
    setImpressionText(impression.impression)
    closeModal()
  }

  const router = useRouter()
  const handleOk = () => {
    startTransition(async () => {
      const result = await editImpression({
        impressionId: impression.id,
        editedImpression: impressionText,
      })
      if (result instanceof Error) {
        window.alert('編集に失敗しました。もう一度試してみてください。')
        return
      }

      closeModal()
    })

    router.refresh()
  }

  return (
    <>
      <button type="button" className="btn" onClick={openModal}>
        編集
      </button>

      <dialog className="modal" ref={dialogRef}>
        <div className="modal-box">
          <h3>感想を編集</h3>

          <div className="mt-4">
            <textarea
              className="
                textarea textarea-bordered textarea-md
                w-full
              "
              placeholder="感想を書いてください"
              value={impressionText}
              onChange={handleChange}
            />
          </div>

          <div className="modal-action">
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleOk}
              disabled={!canEdit}
            >
              Ok
            </button>

            <button type="button" className="btn ml-5" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default EditImpressionButton
