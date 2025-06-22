import type { Metadata } from 'next'
import BookList from '@/app/bookList'

export const metadata: Metadata = {
  title: 'トップページ | company-library',
}

const Home = () => {
  return (
    <div>
      <BookList />
    </div>
  )
}

export default Home
