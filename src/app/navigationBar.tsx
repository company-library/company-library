'use client'

import { FC } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

type NavigationBarProps = {
  userId: number | undefined
}

const NavigationBar: FC<NavigationBarProps> = ({ userId }) => {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-400 text-white">
      <div className="max-w-7xl mx-auto flex">
        <div className="w-1/5 py-4 text-2xl">company-library</div>
        <div className="space-x-6 flex justify-end w-4/5">
          <Link
            href="/"
            className={`rounded-md my-auto px-3 py-2 ${
              pathname === '/' ? 'bg-gray-600' : 'text-gray-200 hover:text-white hover:bg-gray-500'
            } `}
          >
            書籍一覧
          </Link>
          <Link
            href="/books/register"
            className={`rounded-md my-auto px-3 py-2 ${
              pathname === '/books/register'
                ? 'bg-gray-600'
                : 'text-gray-200 hover:text-white hover:bg-gray-500'
            }`}
          >
            登録
          </Link>
          <Link
            href={`/users/${userId}`}
            className={`rounded-md my-auto px-3 py-2 ${
              pathname === `/users/${userId}`
                ? 'bg-gray-600'
                : 'text-gray-200 hover:text-white hover:bg-gray-500'
            }`}
          >
            マイページ
          </Link>
          <Link
            href="/users"
            className={`rounded-md my-auto px-3 py-2 ${
              pathname === '/users'
                ? 'bg-gray-600'
                : 'text-gray-200 hover:text-white hover:bg-gray-500'
            }`}
          >
            利用者一覧
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default NavigationBar
