import { FC } from 'react'
import NavigationBarItem from '@/app/navigationBarItem'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import Link from 'next/link'
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
            company-library
          </Link>
        </div>
        <div className="flex-none">
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
            {user && (
              <li className="pl-3">
                <UserAvatar user={user} size="sm" />
              </li>
            )}
            <li className="my-auto text-gray-200">{userName}</li>
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default NavigationBar
