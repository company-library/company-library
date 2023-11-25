import React, { Suspense } from 'react'
import BookDetail from '@/app/books/[id]/bookDetail'
import { getServerSession } from 'next-auth'
import LendingList from '@/app/books/[id]/lendingList'
import ImpressionList from '@/app/books/[id]/impressionList'
import ReturnList from '@/app/books/[id]/returnList'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

// Next.jsでメタデータを設定した場合のテストに問題があるようなので、一旦コメントアウト
// https://github.com/vercel/next.js/issues/47299#issuecomment-1477912861
// export const metadata: Metadata = {
//   title: '詳細 | company-library',
// }

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

      <div>
        <div className="mt-10">
          <h2>借りている人</h2>
          <Suspense fallback={<div>Loading...</div>}>
            <LendingList bookId={bookId} />
          </Suspense>
        </div>

        <div className="mt-10">
          <h2>感想</h2>
          <Suspense fallback={<div>Loading...</div>}>
            <ImpressionList bookId={bookId} />
          </Suspense>
        </div>

        <div className="mt-10">
          <h2>借りた人</h2>
          <Suspense fallback={<div>Loading...</div>}>
            <ReturnList bookId={bookId} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default BookDetailPage
