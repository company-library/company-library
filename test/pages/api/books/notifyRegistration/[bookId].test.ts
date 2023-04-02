import { describe } from '@jest/globals'

describe('notify registration api handler', () => {
  // const getTokenMock = jest.spyOn(require('next-auth/jwt'), 'getToken')
  // const getWebhookUrlMock = jest.spyOn(require('@/libs/slack/webhook'), 'getWebhookUrl')
  //
  // const getBookByIdMock = jest.spyOn(require('@/generated/graphql'), 'GetBookByIdQuery')
  // const callWebhookMock = jest.spyOn(require('@/libs/slack/webhook'), 'callWebhook')

  it.todo('webhookを叩いて、200を返す', () => {

  })
  it.todo('tokenが取得できないとき、403のエラーを返す')
  it.todo('webhookのURLが設定されていないとき、200を返す')
  it.todo('bookIdがnumberでないとき、400のエラーを返す')
  it.todo('本の取得ができないとき、400のエラーを返す')
})
