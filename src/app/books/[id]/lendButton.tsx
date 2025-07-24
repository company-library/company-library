'use client'

import { useRouter } from 'next/navigation'
import { type FC, startTransition, useRef, useState } from 'react'
import { lendBook } from '@/app/books/[id]/actions'
import { DATE_SYSTEM_FORMAT } from '@/constants'
import { dateStringToDate, getDaysLater, toJstFormat } from '@/libs/luxon/utils'

type LendButtonProps = {
  bookId: number
  userId: number
  disabled: boolean
  locationStats: Map<
    number,
    { name: string; order: number; totalCount: number; lendableCount: number }
  >
}

const LendButton: FC<LendButtonProps> = ({ bookId, userId, disabled, locationStats }) => {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openModal = () => dialogRef.current?.showModal()
  const closeModal = () => dialogRef.current?.close()

  const [dueDate, setDueDate] = useState(getDaysLater(7))
  const [selectedLocationId, setSelectedLocationId] = useState<number | string>('')

  const availableLocations = Array.from(locationStats.entries())
    .filter(([_, stats]) => stats.lendableCount > 0)
    .sort(([_, a], [__, b]) => a.order - b.order)

  const onClick = () => {
    if (!selectedLocationId || selectedLocationId === '') {
      window.alert('保管場所を選択してください。')
      return
    }

    startTransition(async () => {
      const result = await lendBook(bookId, userId, dueDate, Number(selectedLocationId))
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
          <h3 className="font-bold text-lg">借りますか?</h3>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2" htmlFor="locationSelect">
              保管場所を選択してください
            </label>
            <select
              id="locationSelect"
              className="select select-bordered w-full"
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
            >
              <option value="" disabled>
                保管場所を選択
              </option>
              {availableLocations.map(([locationId, stats]) => (
                <option key={locationId} value={locationId}>
                  {stats.name} ({stats.lendableCount}冊利用可能)
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2" htmlFor="dueDate">
              返却期限日
            </label>
            <input
              id="dueDate"
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
