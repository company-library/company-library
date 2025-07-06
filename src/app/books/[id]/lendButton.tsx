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
  locationStats: Map<number, { name: string; totalCount: number; lendableCount: number }>
}

const LendButton: FC<LendButtonProps> = ({ bookId, userId, disabled, locationStats }) => {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openModal = () => dialogRef.current?.showModal()
  const closeModal = () => dialogRef.current?.close()

  const [dueDate, setDueDate] = useState(getDaysLater(7))
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
  
  const availableLocations = Array.from(locationStats.entries())
    .filter(([_, stats]) => stats.lendableCount > 0)
    .sort(([_, a], [__, b]) => b.lendableCount - a.lendableCount)

  const onClick = () => {
    if (!selectedLocationId) {
      window.alert('保管場所を選択してください。')
      return
    }

    startTransition(async () => {
      const result = await lendBook(bookId, userId, dueDate, selectedLocationId)
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
          <h3 className="font-bold text-lg">借りる設定</h3>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">保管場所を選択してください</label>
            <div className="space-y-2">
              {availableLocations.map(([locationId, stats]) => (
                <label key={locationId} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="location"
                    value={locationId}
                    checked={selectedLocationId === locationId}
                    onChange={(e) => setSelectedLocationId(Number(e.target.value))}
                    className="radio radio-primary"
                  />
                  <span className="flex-1">
                    {stats.name} ({stats.lendableCount}冊利用可能)
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">返却期限日</label>
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
