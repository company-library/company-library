import { type NextPage } from 'next'
import Headline from '@/components/common/headline'
import BookForm from '@/app/books/register/bookForm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Next.jsでメタデータを設定した場合のテストに問題があるようなので、一旦コメントアウト
// https://github.com/vercel/next.js/issues/47299#issuecomment-1477912861
// export const metadata: Metadata = {
//   title: '本を登録 | company-library',
// }

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
