import { getByText, render } from '@testing-library/react'
import NavigationBar from '@/components/navigationBar'

describe('navigationBar component', () => {
  jest.spyOn(require('next/router'), 'useRouter').mockReturnValue({ push: jest.fn() })








  it('ナビゲーション項目が表示される', () => {
    const { getByText } = render(<NavigationBar />)

    expect(getByText('company-library')).toBeInTheDocument()
    expect(getByText('書籍一覧')).toBeInTheDocument()
    expect(getByText('登録')).toBeInTheDocument()
    expect(getByText('未返却一覧')).toBeInTheDocument()
  })
})
