import Headline from '@/components/common/headline'
import { render } from '@testing-library/react'

describe('headline component', () => {
  it('見出しの文言が表示される', () => {
    const expectedText = 'test-headline'

    const { getByText } = render(<Headline text={expectedText} />)

    expect(getByText(expectedText)).toBeInTheDocument()
  })
})
