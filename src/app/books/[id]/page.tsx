import React, { Suspense } from 'react'
import BookDetail from '@/app/books/[id]/bookDetail'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

type BookDetailPageParams = {
  params: {
    id: number
  }
}

const BookDetailPage = async ({ params }: BookDetailPageParams) => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return <div>セッションが取得できませんでした。再読み込みしてみてください。</div>
  }
  const userId = session.customUser.id
  const bookId = params.id

  return (
    <div className="px-40">
      <Suspense fallback={<div>Loading...</div>}>
        <BookDetail bookId={bookId} />
      </Suspense>
    </div>
  )
}

export default BookDetailPage
