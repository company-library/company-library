import Books from '@/app/books'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'トップページ | company-library',
}

const Home = () => {
  return (
    <div>
      <Books />
    </div>
  )
}

export default Home
