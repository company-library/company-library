'use client'

import Link from 'next/link'
import type { FC } from 'react'
import NavigationBarItem from '@/app/navigationBarItem'
import UserAvatar from '@/components/userAvatar'

type NavigationBarClientProps = {
  user: {
    id: number
    name: string
    email: string
  } | null
}

const NavigationBarClient: FC<NavigationBarClientProps> = ({ user }) => {
  return (
    <div className="bg-gray-400 text-white">
      <nav className="navbar max-w-7xl mx-auto flex">
        <div className="flex-1">
          <Link href="/" className="text-2xl">
            company-library
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
            <NavigationBarItem
              label="マイページ"
              href={user?.id ? `/users/${user.id}` : '/users'}
            />
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
          <div className="my-auto pl-3 text-gray-200">{user?.name}</div>
        </div>
      </nav>
    </div>
  )
}

export default NavigationBarClient
