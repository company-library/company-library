'use client'

import { type FC, useActionState, useCallback, useEffect, useRef } from 'react'
import { type AddImpressionResult, addImpression } from '@/app/books/[id]/actions'

type Props = {
  bookId: number
}

/**
 * 感想を書くボタン
 * @param bookId 対象の書籍ID
 */
const AddImpressionButton: FC<Props> = ({ bookId }) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openModal = useCallback(() => dialogRef.current?.showModal(), [])
  const closeModal = useCallback(() => dialogRef.current?.close(), [])

  const initialData = {
    success: false,
    value: { impression: '' },
    apiError: null,
  }
  const [formData, action, isPending] = useActionState<AddImpressionResult, FormData>(
    (prev, formData) => addImpression(prev, formData, bookId),
    initialData,
  )

  useEffect(() => {
    if (formData.success) {
      closeModal()
    } else if (formData.apiError) {
      window.alert(formData.apiError.message)
    }
  }, [formData.success, formData.apiError, closeModal])

  return (
    <div>
      <button type="button" className="btn" onClick={openModal}>
        感想を書く
      </button>

      <dialog className="modal" ref={dialogRef}>
        <div className="modal-box">
          <form action={action}>
            <h3>新規感想</h3>

            <div className="mt-4">
              <textarea
                name="impression"
                defaultValue={formData.value.impression}
                className="textarea textarea-bordered textarea-md w-full"
                placeholder="感想を書いてください"
              />
              <p className="text-red-500">{formData.errors?.impression?.join(',')}</p>
            </div>

            <div className="modal-action">
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                Ok
              </button>

              <button type="button" className="btn" disabled={isPending} onClick={closeModal}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  )
}

export default AddImpressionButton
