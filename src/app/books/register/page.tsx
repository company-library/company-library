import { type NextPage } from 'next'
import Headline from '@/components/common/headline'
import BookForm from '@/app/books/register/bookForm'

// Next.jsでメタデータを設定した場合のテストに問題があるようなので、一旦コメントアウト
// https://github.com/vercel/next.js/issues/47299#issuecomment-1477912861
// export const metadata: Metadata = {
//   title: '本を登録 | company-library',
// }

const RegisterPage: NextPage = () => {
  return (
    <>
      <Headline text="本を登録" />

      <div>
        <BookForm />
      </div>
    </>
  )
}

export default RegisterPage
