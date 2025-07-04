import type { Metadata, NextPage } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import BookForm from '@/app/books/register/bookForm'
import Headline from '@/components/common/headline'

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

  return (
    <>
      <Headline text="本を登録" />

      <div>
        <BookForm userId={userId} />
      </div>
    </>
  )
}

export default RegisterPage
