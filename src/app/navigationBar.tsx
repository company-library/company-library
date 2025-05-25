import Link from 'next/link'
import { getServerSession } from 'next-auth'
import type { FC } from 'react'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import NavigationBarItem from '@/app/navigationBarItem'
import UserAvatar from '@/components/userAvatar'

const NavigationBar: FC = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.customUser
  const userId = session?.customUser.id
  const userName = session?.customUser.name

  return (
    <div className="bg-gray-400 text-white">
      <nav className="navbar max-w-7xl mx-auto flex">
        <div className="flex-1">
          <Link href="/" className="text-2xl">
            company-library-beta
          </Link>
        </div>
        <ul className="menu menu-horizontal px-1">
          <li>
            <NavigationBarItem label="書籍一覧" href="/" />
          </li>
          <li>
            <NavigationBarItem label="登録" href="/books/register" />
          </li>
          <li>
            <NavigationBarItem label="マイページ" href={`/users/${userId}`} />
          </li>
          <li>
            <NavigationBarItem label="利用者一覧" href="/users" />
          </li>
        </ul>
        <div className="pl-3 flex">
          {user && (
            <div className="">
              <UserAvatar user={user} size="sm" />
            </div>
          )}
          <div className="my-auto pl-3 text-gray-200">{userName}</div>
        </div>
      </nav>
    </div>
  )
}

export default NavigationBar
