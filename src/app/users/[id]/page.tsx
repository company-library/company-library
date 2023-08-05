import User from '@/app/users/[id]/user'

// Next.jsでメタデータを設定した場合のテストに問題があるようなので、一旦コメントアウト
// https://github.com/vercel/next.js/issues/47299#issuecomment-1477912861
// export const metadata: Metadata = {
//   title: '利用者情報 | company-library',
// }

const UserPage = async ({ params }: { params: { id: string } }) => {
  return <User id={Number(params.id)} />
}

export default UserPage
