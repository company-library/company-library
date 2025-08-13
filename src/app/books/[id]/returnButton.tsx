'use client'

import { useRouter } from 'next/navigation'
import {
  type ChangeEvent,
  type FC,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { returnBookAction } from '@/app/books/[id]/actions'

type ReturnButtonProps = {
  bookId: number
  userId: number
  lendingHistoryId: number
  disabled: boolean
  locationName: string | undefined
}

const ReturnButton: FC<ReturnButtonProps> = ({
  bookId,
  userId,
  lendingHistoryId,
  disabled,
  locationName,
}) => {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openModal = () => dialogRef.current?.showModal()
  const closeModal = useCallback(() => dialogRef.current?.close(), [])

  const [impression, setImpression] = useState('')
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setImpression(e.target.value)
  }

  const [state, formAction, isPending] = useActionState(returnBookAction, {
    success: false,
    error: null,
  })

  const onSubmit = (formData: FormData) => {
    formData.set('bookId', bookId.toString())
    formData.set('userId', userId.toString())
    formData.set('lendingHistoryId', lendingHistoryId.toString())
    formData.set('impression', impression)

    formAction(formData)
  }

  useEffect(() => {
    if (state.success) {
      closeModal()
      router.refresh()
    } else if (state.error) {
      window.alert(state.error)
    }
  }, [state, router, closeModal])

  return (
    <>
      <button type="button" className="btn" disabled={disabled} onClick={openModal}>
        返却する
      </button>

      <dialog className="modal" ref={dialogRef}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">返却しますか?</h3>
          {locationName && <p className="mt-2 text-sm text-gray-600">返却先: {locationName}</p>}

          <div className="mt-4">
            <textarea
              className="
               textarea textarea-bordered textarea-md
               w-full
              "
              placeholder="感想を書いてください"
              value={impression}
              onChange={handleChange}
            />
          </div>

          <div className="modal-action">
            <form action={onSubmit}>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    処理中...
                  </>
                ) : (
                  'Ok'
                )}
              </button>
            </form>

            <button type="button" className="btn ml-5" onClick={closeModal} disabled={isPending}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default ReturnButton
