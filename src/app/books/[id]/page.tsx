import React, { Suspense } from 'react'
import BookDetail from '@/components/bookDetail'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

type BookDetailPageParams = {
  params: {
    id: string
  }
}

const BookDetailPage = async ({ params }: BookDetailPageParams) => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return <div>セッションが取得できませんでした。再読み込みしてみてください。</div>
  }
  const userId = session.customUser.id
  const bookId = Number(params.id)
  if (isNaN(bookId)) {
    return <div>不正な書籍です。</div>
  }

  return (
    <div className="px-40">
      <Suspense fallback={<div>Loading...</div>}>
        <BookDetail bookId={bookId} userId={userId} />
      </Suspense>
    </div>
  )
}

export default BookDetailPage
