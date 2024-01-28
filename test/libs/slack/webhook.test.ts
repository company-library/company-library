import { describe } from '@jest/globals'
import { notifySlack } from '@/libs/slack/webhook'

describe('notifySlack function', () => {
  beforeEach(() => {
    // テストごとに環境変数を書き換えられるように、各テスト実行前に設定する
    process.env.SLACK_WEBHOOK_URL = 'slack-webhook-url'
  })

  it('Slackのwebhookがキックされる', async () => {
    const expectedText = 'sample message'
    const sendMock = jest.fn()
    jest.spyOn(require('@slack/webhook'), 'IncomingWebhook').mockImplementation(() => {
      return {
        send: sendMock
      }
    })

    await notifySlack(expectedText)

    expect(sendMock).toBeCalledWith({
      username: 'company-librarian',
      icon_emoji: ':teacher:',
      text: expectedText
    })
  })
})
