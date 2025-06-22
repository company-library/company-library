import { DateTime, Settings } from 'luxon'
import { DATE_SYSTEM_FORMAT } from '@/constants'
import { dateStringToDate, getDaysLater, isOverdue, toJstFormat } from '@/libs/luxon/utils'

describe('Luxon utils', () => {
  describe('toJstFormat', () => {
    it('フォーマットを指定した場合、そのフォーマットのJSTが返る', () => {
      const utcDate = new Date(Date.UTC(2022, 9, 31, 16, 0, 0))

      expect(toJstFormat(utcDate, DATE_SYSTEM_FORMAT)).toBe('2022-11-01')
    })

    it('フォーマットを指定しなかった場合、既定フォーマットのJSTが返る', () => {
      const utcDate = new Date(Date.UTC(2022, 9, 31, 16, 0, 0))

      expect(toJstFormat(utcDate)).toBe('2022/11/01')
    })
  })

  describe('dateStringToDate', () => {
    it('引数で渡した日付文字列をDate型に変換する', () => {
      const str = '2022-11-01'

      expect(dateStringToDate(str)).toEqual(new Date(Date.UTC(2022, 9, 31, 15, 0, 0)))
    })
  })

  describe('isOverdue', () => {
    it.each([
      {
        caseName: '期限を過ぎていない場合',
        // 2022/10/10 23:59:57 (JST)
        now: DateTime.local(2022, 10, 10, 22, 59, 57),
        expected: false,
      },
      {
        caseName: '期限と同時刻の場合',
        // 2022/10/10 23:59:58 (JST)
        now: DateTime.local(2022, 10, 10, 23, 59, 58),
        expected: false,
      },
      {
        caseName: '期限の時刻を過ぎて、日付を過ぎてない場合',
        // 2022/10/10 23:59:59 (JST)
        now: DateTime.local(2022, 10, 10, 23, 59, 59),
        expected: false,
      },
      {
        caseName: '期限の日付を過ぎた場合',
        // 2022/10/11 00:00:00 (JST)
        now: DateTime.local(2022, 10, 11, 0, 0, 0),
        expected: true,
      },
    ])('$caseName、$expectedを返す', ({ now, expected }) => {
      Settings.now = () => now.toMillis()
      // 2022/10/10 23:59:58 (JST)
      const deadline = new Date(Date.UTC(2022, 9, 10, 14, 59, 58))

      expect(isOverdue(deadline)).toBe(expected)
    })
  })

  describe('getDaysLaterJstDate', () => {
    it('引数で渡した日数経過後の日付を返す', () => {
      const now = DateTime.local(2022, 10, 1, 0, 0, 0, { zone: 'Asia/Tokyo' })
      Settings.now = () => now.toMillis()

      expect(getDaysLater(10).toISOString()).toBe('2022-10-10T15:00:00.000Z') // 2022/10/11 00:00:00 (JST)
    })
  })
})
