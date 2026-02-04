'use client'

import type { FC } from 'react'
import BookForm from '@/app/books/register/bookForm'
import Headline from '@/components/common/headline'

type RegisterPageClientProps = {
  userId: number
}

const RegisterPageClient: FC<RegisterPageClientProps> = ({ userId }) => {
  return (
    <>
      <Headline text="本を登録" />

      <div>
        <BookForm userId={userId} />
      </div>
    </>
  )
}

export default RegisterPageClient
