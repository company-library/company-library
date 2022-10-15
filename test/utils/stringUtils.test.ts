import { formatForSearch } from '@/utils/stringUtils'

describe('stringUtils', () => {
  describe('formatForSearch function', () => {
    it('半角の大文字に変換されること', () => {
      expect(formatForSearch('０Ａａ')).toBe('0AA')
    })
  })
})
