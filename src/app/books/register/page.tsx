import type { Metadata, NextPage } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import RegisterPageClient from '@/app/books/register/registerPageClient'

export const metadata: Metadata = {
  title: '本を登録 | company-library',
}

/**
 * 書籍登録するページ
 * @returns {JSX.Element}
 * @constructor
 */
const RegisterPage: NextPage = async () => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return <div>セッションが取得できませんでした。再読み込みしてみてください。</div>
  }
  const userId = session.customUser.id

  return <RegisterPageClient userId={userId} />
}

export default RegisterPage
