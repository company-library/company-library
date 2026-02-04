'use client'

import type { FC, ReactNode } from 'react'

type BookDetailPageClientProps = {
  bookDetailSection: ReactNode
  lendingListSection: ReactNode
  impressionListSection: ReactNode
  returnListSection: ReactNode
}

const BookDetailPageClient: FC<BookDetailPageClientProps> = ({
  bookDetailSection,
  lendingListSection,
  impressionListSection,
  returnListSection,
}) => {
  return (
    <div className="px-40">
      {bookDetailSection}

      <div>
        <div className="mt-10">
          <h2 className="text-lg">借りているユーザー</h2>
          {lendingListSection}
        </div>

        <div className="mt-10">
          <h2 className="text-lg">感想</h2>
          {impressionListSection}
        </div>

        <div className="mt-10">
          <h2 className="text-lg">借りたユーザー</h2>
          {returnListSection}
        </div>
      </div>
    </div>
  )
}

export default BookDetailPageClient
