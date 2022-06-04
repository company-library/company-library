import { VFC } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

const NavigationBar: VFC = () => {
  const router = useRouter()

  return (
    <nav className="bg-gray-400 text-white">
      <div className="max-w-7xl mx-auto flex">
        <div className="w-1/5 p-4 text-2xl">company-library</div>
        <div className="space-x-6 flex justify-end w-4/5">
          <Link href="/">
            <a
              className={`rounded-md my-auto px-3 py-2 ${
                router.pathname === '/'
                  ? 'bg-gray-600'
                  : 'text-gray-200 hover:text-white hover:bg-gray-500'
              } `}
            >
              書籍一覧
            </a>
          </Link>
          <Link href="#">
            <a
              className={`rounded-md my-auto px-3 py-2 ${
                router.pathname === '#'
                  ? 'bg-gray-600'
                  : 'text-gray-200 hover:text-white hover:bg-gray-500'
              }`}
            >
              登録
            </a>
          </Link>
          <Link href="#">
            <a
              className={`rounded-md my-auto px-3 py-2 ${
                router.pathname === '#'
                  ? 'bg-gray-600'
                  : 'text-gray-200 hover:text-white hover:bg-gray-500'
              }`}
            >
              未返却一覧
            </a>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default NavigationBar
