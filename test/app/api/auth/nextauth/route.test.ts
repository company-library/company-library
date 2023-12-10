/**
 * server側で実行されるコードのため、テスト環境をnodeに変更する
 * https://stackoverflow.com/questions/76379428/how-to-test-nextjs-app-router-api-route-with-jest
 * @jest-environment node
 */

import { HTTP_METHODS } from 'next/dist/server/web/http'

describe('auth api', () => {
  it.each(
    HTTP_METHODS.map((hm) => ({
      method: hm,
      expectedExisted: hm === 'GET' || hm === 'POST',
      expected: hm === 'GET' || hm === 'POST' ? '存在する' : '存在しない',
    })),
  )('$methodのハンドラーは$expected', ({ method, expectedExisted }) => {
    const handler = require('@/app/api/auth/[...nextauth]/route')

    expectedExisted
      ? expect(handler[method]).not.toBeUndefined()
      : expect(handler[method]).toBeUndefined()
  })
})
