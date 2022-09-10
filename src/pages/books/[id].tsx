import { NextPage } from 'next'
import Layout from '@/components/layout'
import { useGetBookQuery } from '@/generated/graphql.client'
import { useRouter } from 'next/router'
import Image from 'next/image'
import LendButton from '@/components/lendButton'

const BookDetail: NextPage = () => {
  const router = useRouter()
  const bookId = Number(router.query.id)

  const [result] = useGetBookQuery({ variables: { id: bookId } })

  if (result.fetching || result.error || !result.data) {
    return (
      <Layout title={'詳細 | company-library'}>
        {result.fetching ? <div>Loading...</div> : <div>Error!</div>}
      </Layout>
    )
  }

  const book = result.data.books[0]

  return (
    <Layout title={`${book.title} | company-library`}>
      <div>
        <div>
          <Image
            src={book.imageUrl ? book.imageUrl : '/no_image.jpg'}
            alt={book.title}
            width={128}
            height={200}
          />
        </div>
        <div>{book.title}</div>
        <div>貸し出し状況</div>
        <LendButton bookId={bookId} />
        <button className="bg-gray-400 hover:bg-gray-300 text-white rounded px-4 py-2">
          返却する
        </button>
        <div>借りた人</div>
        <div>感想</div>
      </div>
    </Layout>
  )
}

export default BookDetail
