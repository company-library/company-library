import BookList from '@/app/bookList'
import { Metadata } from 'next'

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
