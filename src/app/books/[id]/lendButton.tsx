'use client'

import { FC, startTransition, useRef, useState } from 'react'
import { DATE_SYSTEM_FORMAT } from '@/constants'
import { dateStringToDate, getDaysLater, toJstFormat } from '@/libs/luxon/utils'
import { lendBook } from '@/app/books/[id]/actions'
import { useRouter } from 'next/navigation'

type LendButtonProps = {
  bookId: number
  userId: number
  disabled: boolean
}

const LendButton: FC<LendButtonProps> = ({ bookId, userId, disabled }) => {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openModal = () => dialogRef.current && dialogRef.current.showModal()
  const closeModal = () => dialogRef.current && dialogRef.current.close()

  const [dueDate, setDueDate] = useState(getDaysLater(7))
  const onClick = () => {
    // @ts-expect-error canaryバージョンでstartTransitionの型定義に変更があったが、@types/reactにはまだ反映されていない
    startTransition(async () => {
      const result = await lendBook(bookId, userId, dueDate)
      if (result instanceof Error) {
        window.alert('貸し出しに失敗しました。もう一度試してみてください。')
        return
      }

      closeModal()
      router.refresh()
    })
  }

  return (
    <>
      <button type="button" className="btn" disabled={disabled} onClick={openModal}>
        借りる
      </button>

      <dialog className="modal" ref={dialogRef}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">何日まで借りますか？</h3>

          <div className="mt-4">
            <input
              type="date"
              className="
                input input-bordered
                w-full p-2.5
              "
              value={toJstFormat(dueDate, DATE_SYSTEM_FORMAT)}
              onChange={(e) => setDueDate(dateStringToDate(e.target.value))}
              min={toJstFormat(new Date(), DATE_SYSTEM_FORMAT)}
            />
          </div>

          <div className="modal-action">
            <button type="submit" className="btn btn-primary" onClick={onClick}>
              Ok
            </button>

            <button type="button" className="btn ml-5" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default LendButton
