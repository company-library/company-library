import { NextPage } from 'next'
import Layout from '@/components/layout'
import React, { ChangeEvent, useState } from 'react'
import { formatForSearch } from '@/utils/stringUtils'
import GoogleBook from '@/components/googleBook'

const Register: NextPage = () => {
  const [isbn, setIsbn] = useState('')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const formattedIsbn = formatForSearch(event.target.value.replace(/[-ー]/g, ''))
    setIsbn(formattedIsbn)
  }

  return (
    <Layout title="本を登録 | company-library">
      <div>
        <p className="text-4xl">本を登録</p>
      </div>

      <div className="flex flex-wrap">
        <label>
          ISBN（13桁）を入力してください
          <input
            type="text"
            onChange={handleChange}
            className="mt-1 block w-72 rounded-md border-2 border-gray-300 shadow-sm"
            defaultValue="9784"
          />
        </label>

        {isbn.length === 13 && <GoogleBook isbn={isbn} />}
      </div>
    </Layout>
  )
}

export default Register
