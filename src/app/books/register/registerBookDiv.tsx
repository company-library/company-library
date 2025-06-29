'use client'

import type { FC } from 'react'
import { useState } from 'react'
import useSWR from 'swr'
import { registerBook } from '@/app/books/register/actions'
import fetcher from '@/libs/swr/fetcher'
import { type CustomError, isCustomError } from '@/models/errors'

type RegisterBookDivProps = {
  title: string
  isbn: string
  thumbnailUrl: string | undefined
  userId: number
}

type Location = {
  id: number
  name: string
}

/**
 * 書籍登録のためのdiv
 * @param {string} title
 * @param {string} isbn
 * @param {string | undefined} thumbnailUrl
 * @param {number} userId
 * @returns {JSX.Element}
 * @constructor
 */
const RegisterBookDiv: FC<RegisterBookDivProps> = ({ title, isbn, thumbnailUrl, userId }) => {
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
    await registerBook(title, isbn, thumbnailUrl, selectedLocationId, userId)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="location-select" className="block text-sm font-medium mb-2">
          保管場所を選択してください
        </label>
        <select
          id="location-select"
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
        className="rounded-md px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        登録する
      </button>
    </form>
  )
}

export default RegisterBookDiv
