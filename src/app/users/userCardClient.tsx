'use client'

import Link from 'next/link'
import type { FC } from 'react'
import UserAvatar from '@/components/userAvatar'
import type { UserSummary } from '@/models/user'

type UserCardClientProps = {
  user: UserSummary
  readingBookCount: number
  haveReadBookCount: number
}

const UserCardClient: FC<UserCardClientProps> = ({ user, readingBookCount, haveReadBookCount }) => {
  return (
    <Link href={`/users/${user.id}`} data-testid="userProfileLink">
      <div className="cursor-pointer col-span-1 bg-white rounded-lg border shadow-sm divide-y divide-gray-200">
        <div className="w-full flex items-center justify-between p-6 space-x-6">
          <div>
            <p className="text-gray-900 text-sm font-medium truncate">{user.name}</p>
            <p className="mt-1 text-gray-500 text-sm truncate">{user.email}</p>
          </div>
          <UserAvatar user={user} />
        </div>
        <div className="-mt-px flex divide-x divide-gray-200">
          <div className="py-3 w-0 flex-1 flex">
            <span className="ml-3 text-gray-500 text-sm">現在読んでいる冊数</span>
            <span className="ml-1 text-black text-sm" data-testid="readingBookCount">
              {readingBookCount}
            </span>
          </div>
          <div className="-ml-px w-0 flex-1 flex">
            <span className="ml-3 text-gray-500 text-sm">今まで借りた冊数</span>
            <span className="ml-1 text-black text-sm" data-testid="haveReadBookCount">
              {haveReadBookCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default UserCardClient
