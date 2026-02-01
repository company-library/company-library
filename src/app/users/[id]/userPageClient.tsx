'use client'

import type { FC, ReactNode } from 'react'

type UserPageClientProps = {
  userName: string
  readingBooksCount: number
  haveReadBooksCount: number
  readingBookListSection: ReactNode
  bookListSection: ReactNode
}

const UserPageClient: FC<UserPageClientProps> = ({
  userName,
  readingBooksCount,
  haveReadBooksCount,
  readingBookListSection,
  bookListSection,
}) => {
  return (
    <>
      <h1 className="text-3xl">{userName}さんの情報</h1>
      <div className="mt-8">
        <h2 className="text-xl">現在読んでいる書籍({readingBooksCount}冊)</h2>
        <div className="mt-2">{readingBookListSection}</div>
      </div>
      <div className="mt-6">
        <h2 className="text-xl">今まで読んだ書籍({haveReadBooksCount}冊)</h2>
        <div className="mt-2">{bookListSection}</div>
      </div>
    </>
  )
}

export default UserPageClient
