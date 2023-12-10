import { FC } from 'react'
import NavigationBarItem from '@/app/navigationBarItem'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

const NavigationBar: FC = async () => {
  const session = await getServerSession(authOptions)
  const userId = session?.customUser.id

  return (
    <nav className="bg-gray-400 text-white">
      <div className="max-w-7xl mx-auto flex">
        <div className="w-1/5 py-4 text-2xl">company-library</div>
        <div className="space-x-6 flex justify-end w-4/5">
          <NavigationBarItem label="書籍一覧" href="/" />
          <NavigationBarItem label="登録" href="/books/register" />
          <NavigationBarItem label="マイページ" href={`/users/${userId}`} />
          <NavigationBarItem label="利用者一覧" href="/users" />
        </div>
      </div>
    </nav>
  )
}

export default NavigationBar
