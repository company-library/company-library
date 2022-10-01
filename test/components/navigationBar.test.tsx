import { getByText, render } from '@testing-library/react'
import NavigationBar from '@/components/navigationBar'

describe('navigationBar component', () => {
  const routerMock = jest
    .spyOn(require('next/router'), 'useRouter')
    .mockReturnValue({ push: jest.fn() })

  it('ナビゲーション項目が表示される', () => {
    const { getByText } = render(<NavigationBar />)

    expect(getByText('company-library')).toBeInTheDocument()
    expect(getByText('書籍一覧')).toBeInTheDocument()
    expect(getByText('書籍一覧')).not.toHaveClass('bg-gray-600')
    expect(getByText('登録')).toBeInTheDocument()
    expect(getByText('登録')).not.toHaveClass('bg-gray-600')
    expect(getByText('未返却一覧')).toBeInTheDocument()
    expect(getByText('未返却一覧')).not.toHaveClass('bg-gray-600')
  })

  it('pathが/books/registerの場合、登録ボタンのデザインが強調される', () => {
    routerMock.mockReturnValueOnce({
      push: jest.fn(),
      pathname: '/books/register',
    })

    const { getByText } = render(<NavigationBar />)

    expect(getByText('登録')).toHaveClass('bg-gray-600')
  })
})
