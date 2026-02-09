'use client'

import type { FC } from 'react'
import UserCardClient from '@/app/users/userCardClient'
import type { UserSummary } from '@/models/user'

type UserWithCounts = {
  user: UserSummary
  readingBookCount: number
  haveReadBookCount: number
  avatarUrl: string | undefined
}

type UsersClientProps = {
  usersWithCounts: UserWithCounts[]
}

const UsersClient: FC<UsersClientProps> = ({ usersWithCounts }) => {
  return (
    <>
      <h1 className="text-3xl mb-8">利用者一覧</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {usersWithCounts.map(({ user, readingBookCount, haveReadBookCount, avatarUrl }) => {
          return (
            <UserCardClient
              key={user.id}
              user={user}
              readingBookCount={readingBookCount}
              haveReadBookCount={haveReadBookCount}
              avatarUrl={avatarUrl}
            />
          )
        })}
      </div>
    </>
  )
}

export default UsersClient
