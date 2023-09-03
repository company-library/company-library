import React, { Suspense } from 'react'
import BookDetail from '@/components/bookDetail'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import LendingList from '@/app/books/[id]/lendingList'
import ImpressionList from '@/app/books/[id]/impressionList'
import ReturnList from '@/app/books/[id]/returnList'

type BookDetailPageParams = {
  params: {
    id: string
  }
}

const BookDetailPage = async ({ params }: BookDetailPageParams) => {
  const bookId = Number(params.id)
  if (isNaN(bookId)) {
    return <div>不正な書籍です。</div>
  }

  const session = await getServerSession(authOptions)
  if (!session) {
    return <div>セッションが取得できませんでした。再読み込みしてみてください。</div>
  }
  const userId = session.customUser.id

  return (
    <div className="px-40">
      <Suspense fallback={<div>Loading...</div>}>
        <BookDetail bookId={bookId} userId={userId} />
      </Suspense>

      <div className="mt-10">
        <Suspense fallback={<div>Loading...</div>}>
          <LendingList bookId={bookId} />
        </Suspense>

        <Suspense fallback={<div>Loading...</div>}>
          <ImpressionList bookId={bookId} />
        </Suspense>

        <Suspense fallback={<div>Loading...</div>}>
          <ReturnList bookId={bookId} />
        </Suspense>
      </div>
    </div>
  )
}

export default BookDetailPage
