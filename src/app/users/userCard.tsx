import type { FC } from 'react'
import UserCardClient from '@/app/users/userCardClient'
import { readingHistories } from '@/hooks/server/readingHistories'
import type { UserSummary } from '@/models/user'

type UserCardProps = {
  user: UserSummary
}

const UserCard: FC<UserCardProps> = async ({ user }) => {
  const { readingBooks, haveReadBooks } = readingHistories(user.lendingHistories)

  return (
    <UserCardClient
      user={user}
      readingBookCount={readingBooks.length}
      haveReadBookCount={haveReadBooks.length}
    />
  )
}

export default UserCard
