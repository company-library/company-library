import { formatForSearch } from '@/utils/stringUtils'

describe('stringUtils', () => {
  it('formatForSearch function', () => {
    expect(formatForSearch('０Ａａ')).toBe('0AA')
  })
})
