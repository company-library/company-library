import { FC } from 'react'
import Image from 'next/image'
import { UserSummary } from '@/models/user'
import Link from 'next/link'

type UserCardProps = {
  user: UserSummary
}

const UserCard: FC<UserCardProps> = ({ user }) => {
  const lendingHistories = user.lendingHistories
    .map((h) => {
      return {
        bookId: h.bookId,
        isReturned: !!h.returnHistory?.returnedAt,
      }
    })
    .reduce<Array<{ bookId: number; isReturned: boolean }>>((acc, obj) => {
      return acc.some((a) => a.bookId === obj.bookId && a.isReturned === obj.isReturned)
        ? acc
        : [...acc, obj]
    }, [])

  const readingBooks = lendingHistories.filter((h) => !h.isReturned)
  const haveReadBooks = lendingHistories.filter((h) => h.isReturned)

  return (
    <Link href={`/users/${user.id}`} data-testid="userProfileLink">
      <div className="cursor-pointer col-span-1 bg-white rounded-lg border shadow divide-y divide-gray-200">
        <div className="w-full flex items-center justify-between p-6 space-x-6">
          <div>
            <p className="text-gray-900 text-sm font-medium truncate">{user.name}</p>
            <p className="mt-1 text-gray-500 text-sm truncate">{user.email}</p>
          </div>
          {user.imageUrl && (
            <Image
              src={user.imageUrl}
              alt={`${user.name}のプロフィール画像`}
              width="60"
              height="60"
              className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"
              data-testid="profileImage"
            />
          )}
        </div>
        <div className="-mt-px flex divide-x divide-gray-200">
          <div className="py-3 w-0 flex-1 flex">
            <span className="ml-3 text-gray-500 text-sm">現在読んでいる冊数</span>
            <span className="ml-1 text-sm" data-testid="readingBookCount">
              {readingBooks.length}
            </span>
          </div>
          <div className="py-3 -ml-px w-0 flex-1 flex">
            <span className="ml-3 text-gray-500 text-sm">今まで借りた冊数</span>
            <span className="ml-1 text-sm" data-testid="haveReadBookCount">
              {haveReadBooks.length}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default UserCard
