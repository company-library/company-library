import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import BookDetail from '@/app/books/[id]/bookDetail'
import ImpressionList from '@/app/books/[id]/impressionList'
import LendingList from '@/app/books/[id]/lendingList'
import ReturnList from '@/app/books/[id]/returnList'
import prisma from '@/libs/prisma/client'
import { getServerSession } from 'next-auth'
import React, { Suspense } from 'react'

type BookDetailPageParams = {
  params: Promise<{
    id: string
  }>
}

export const generateMetadata = async (props: BookDetailPageParams) => {
  const params = await props.params
  const bookId = Number(params.id)
  if (Number.isNaN(bookId)) {
    return { title: '書籍詳細 | company-library' }
  }

  const bookDetail = await prisma.book
    .findUnique({
      where: { id: bookId },
      select: {
        title: true,
      },
    })
    .catch((e) => {
      console.error(e)
      return new Error('Book fetch failed')
    })
  if (bookDetail instanceof Error || !bookDetail) {
    return { title: '書籍詳細 | company-library' }
  }

  return {
    title: `${bookDetail.title} | company-library`,
  }
}

const BookDetailPage = async (props: BookDetailPageParams) => {
  const params = await props.params
  const bookId = Number(params.id)
  if (Number.isNaN(bookId)) {
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
          <h2 className="text-lg">借りているユーザー</h2>
          <Suspense fallback={<div>Loading...</div>}>
            <LendingList bookId={bookId} />
          </Suspense>
        </div>

        <div className="mt-10">
          <h2 className="text-lg">感想</h2>
          <Suspense fallback={<div>Loading...</div>}>
            <ImpressionList bookId={bookId} userId={userId} />
          </Suspense>
        </div>

        <div className="mt-10">
          <h2 className="text-lg">借りたユーザー</h2>
          <Suspense fallback={<div>Loading...</div>}>
            <ReturnList bookId={bookId} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default BookDetailPage
