import { FC } from 'react'
import Image from 'next/image'
import { UserSummary } from '@/models/user'

type UserCardProps = {
  user: UserSummary
}

const UserCard: FC<UserCardProps> = ({ user }) => {
  const haveReadBookCount = user.lendingHistories.filter(
    (history) => history.returnHistories_aggregate.aggregate?.count ?? 0 > 0,
  ).length
  const readingBookCount = user.lendingHistories.filter(
    (history) => history.returnHistories_aggregate.aggregate?.count === 0,
  ).length

  return (
    <div className="col-span-1 bg-white rounded-lg border shadow divide-y divide-gray-200">
      <div className="w-full flex items-center justify-between p-6 space-x-6">
        <div className="flex-1 truncate">
          <div className="flex items-center space-x-3">
            <h3 className="text-gray-900 text-sm font-medium truncate">{user.name}</h3>
          </div>
          <p className="mt-1 text-gray-500 text-sm truncate">{user.email}</p>
        </div>
        {user.imageUrl && (
          <Image
            src={user.imageUrl}
            alt={`${user.name}のプロフィール画像`}
            layout="fill"
            className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"
            data-testid="profileImage"
          />
        )}
      </div>
      <div>
        <div className="-mt-px flex divide-x divide-gray-200">
          <div className="py-3 w-0 flex-1 flex">
            <span className="ml-3 text-gray-500 text-sm">今まで借りた冊数</span>
            <span className="ml-1 text-sm" data-testid="haveReadBookCount">
              {haveReadBookCount}
            </span>
          </div>
          <div className="py-3 -ml-px w-0 flex-1 flex">
            <span className="ml-3 text-gray-500 text-sm">現在読んでいる冊数</span>
            <span className="ml-1 text-sm" data-testid="readingBookCount">
              {readingBookCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserCard
