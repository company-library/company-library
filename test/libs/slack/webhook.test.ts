import { describe } from '@jest/globals'
import { callWebhook, getWebhookUrl } from '@/libs/slack/webhook'

describe('webhook', () => {
  describe('getWebhookUrl function', () => {
    it('環境変数にwebhookのURLが設定されていないとき、undefinedを返す', () => {
      const consoleMock = jest.fn()
      console.debug = consoleMock

      const result = getWebhookUrl()

      expect(result).toBeUndefined()
      expect(consoleMock).toBeCalledWith('SLACK_WEBHOOK_URL is not set in the environment variable')
    })

    it('環境変数にwebhookのURLが設定されているとき、webhookのURLを返す', () => {
      const expectedUrl = 'https://example.com'
      process.env.SLACK_WEBHOOK_URL = expectedUrl

      const result = getWebhookUrl()

      expect(result).toBe(expectedUrl)
    })
  })

  describe('callWebhook function', () => {
    it('Slackのwebhookがキックされる', async () => {
      const expectedText = 'sample message'
      const sendMock = jest.fn()
      jest.spyOn(require('@slack/webhook'), 'IncomingWebhook').mockImplementation(() => {
        return {
          send: sendMock
        }
      })

      await callWebhook('', expectedText)

      expect(sendMock).toBeCalledWith({
        username: 'company-librarian',
        icon_emoji: ':teacher:',
        text: expectedText
      })
    })
  })
})
