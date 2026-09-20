import { describe, expect, it } from 'vitest'
import { validateDate } from '@/utils/dateUtils'

describe('dateUtils', () => {
  describe('validateDate function', () => {
    it('有効な日付文字列を正しくDateオブジェクトに変換すること', () => {
      const result = validateDate('2024-01-15')
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(0) // 0-indexed
      expect(result?.getDate()).toBe(15)
    })

    it('ISO形式の日付文字列を正しく変換すること', () => {
      const result = validateDate('2024-01-15T10:30:00.000Z')
      expect(result).toBeInstanceOf(Date)
      expect(result?.toISOString()).toBe('2024-01-15T10:30:00.000Z')
    })

    it('undefinedが渡された場合はundefinedを返すこと', () => {
      expect(validateDate(undefined)).toBeUndefined()
    })

    it('空文字列が渡された場合はundefinedを返すこと', () => {
      expect(validateDate('')).toBeUndefined()
    })

    it('無効な日付文字列が渡された場合はundefinedを返すこと', () => {
      expect(validateDate('invalid-date')).toBeUndefined()
    })

    it('無効な日付（存在しない月）が渡された場合はundefinedを返すこと', () => {
      expect(validateDate('2024-13-01')).toBeUndefined()
    })

    it('JavaScriptのDate APIが自動補正する日付は有効として扱うこと', () => {
      // 2024-02-30は2024-03-01に自動補正される（JavaScriptの仕様）
      const result = validateDate('2024-02-30')
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(2) // 3月
      expect(result?.getDate()).toBe(1)
    })

    it('数値のみの文字列は年として解釈されること', () => {
      // JavaScriptのDate APIは数値文字列を年として解釈する
      const result = validateDate('2024')
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2024)
    })
  })
})
