import { describe, expect, it } from 'vitest'
import robots from './robots'

describe('robots', () => {
  it('全てのクローラーに対して全パスのクロールを禁止する', () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    })
  })
})
