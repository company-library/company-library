'use client'

import type { FC } from 'react'
import { useState } from 'react'
import useSWR from 'swr'
import { addBook } from '@/app/books/register/actions'
import fetcher from '@/libs/swr/fetcher'
import { type CustomError, isCustomError } from '@/models/errors'

type AddBookDivProps = {
  companyBook: {
    id: number
    _count: {
      registrationHistories: number
    }
  }
  userId: number
}

type Location = {
  id: number
  name: string
}

/**
 * 書籍追加のためのdiv
 * @param {{id: number, _count: {registrationHistories: number}}} companyBook
 * @param {number} userId
 * @returns {JSX.Element}
 * @constructor
 */
const AddBookDiv: FC<AddBookDivProps> = ({ companyBook, userId }) => {
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)

  const { data: locationsData, error } = useSWR<{ locations: Location[] } | CustomError>(
    '/api/locations',
    fetcher,
  )

  if (error || isCustomError(locationsData)) {
    return <div>保管場所の取得に失敗しました</div>
  }

  const locations = locationsData?.locations || []

  const handleSubmit = async (_formData: FormData) => {
    if (selectedLocationId === null) {
      alert('保管場所を選択してください')
      return
    }
    await addBook(companyBook.id, userId, selectedLocationId)
  }

  return (
    <>
      <p>
        すでに登録されています
        <br />
        現在の登録冊数：{companyBook._count.registrationHistories}
      </p>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="location-select-add" className="block text-sm font-medium mb-2">
            保管場所を選択してください
          </label>
          <select
            id="location-select-add"
            value={selectedLocationId || ''}
            onChange={(e) => setSelectedLocationId(Number(e.target.value))}
            className="w-48 rounded-md border-2 border-gray-300 px-3 py-2"
            required
          >
            <option value="">-- 保管場所を選択 --</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={selectedLocationId === null}
          className="rounded-md my-auto px-3 py-2 bg-gray-400 text-white hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          追加する
        </button>
      </form>
    </>
  )
}

export default AddBookDiv
