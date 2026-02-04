import type { FC } from 'react'
import UserCardClient from '@/app/users/userCardClient'
import { readingHistories } from '@/hooks/server/readingHistories'
import { getAvatarUrl } from '@/libs/gravatar/getAvatarUrl'
import type { UserSummary } from '@/models/user'

type UserCardProps = {
  user: UserSummary
}

const UserCard: FC<UserCardProps> = async ({ user }) => {
  const { readingBooks, haveReadBooks } = readingHistories(user.lendingHistories)
  const avatarUrl = await getAvatarUrl(user.email)

  return (
    <UserCardClient
      user={user}
      readingBookCount={readingBooks.length}
      haveReadBookCount={haveReadBooks.length}
      avatarUrl={avatarUrl}
    />
  )
}

export default UserCard
