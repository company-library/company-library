import { FC } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useCustomUser } from '@/hooks/useCustomUser'

const NavigationBar: FC = () => {
  const router = useRouter()
  const { user } = useCustomUser()

  return (
    <nav className="bg-gray-400 text-white">
      <div className="max-w-7xl mx-auto flex">
        <div className="w-1/5 py-4 text-2xl">company-library</div>
        <div className="space-x-6 flex justify-end w-4/5">
          <Link
            href="/"
            className={`rounded-md my-auto px-3 py-2 ${
              router.pathname === '/'
                ? 'bg-gray-600'
                : 'text-gray-200 hover:text-white hover:bg-gray-500'
            } `}>
            書籍一覧
          </Link>
          <Link
            href="/books/register"
            className={`rounded-md my-auto px-3 py-2 ${
              router.pathname === '/books/register'
                ? 'bg-gray-600'
                : 'text-gray-200 hover:text-white hover:bg-gray-500'
            }`}>
            登録
          </Link>
          <Link
            href={`/users/${user?.id}`}
            className={`rounded-md my-auto px-3 py-2 ${
              router.asPath === `/users/${user?.id}`
                ? 'bg-gray-600'
                : 'text-gray-200 hover:text-white hover:bg-gray-500'
            }`}>
            未返却一覧
          </Link>
          <Link
            href="/users"
            className={`rounded-md my-auto px-3 py-2 ${
              router.pathname === '/users'
                ? 'bg-gray-600'
                : 'text-gray-200 hover:text-white hover:bg-gray-500'
            }`}>
            利用者一覧
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default NavigationBar
