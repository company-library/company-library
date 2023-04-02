import process from 'process'
import { IncomingWebhook } from '@slack/webhook'

/**
 * SlackのwebhookのURLを取得する関数
 * @returns {string | undefined}
 */
export const getWebhookUrl = (): string | undefined => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    console.debug('SLACK_WEBHOOK_URL is not set in the environment variable')
  }

  return webhookUrl
}

/**
 * Slackのwebhookをキックする関数
 * @param {string} webhookUrl
 * @param {string} text
 * @returns {Promise<void>}
 */
export const callWebhook = async (webhookUrl: string, text: string) => {
  const webhook = new IncomingWebhook(webhookUrl)

  await webhook.send({
    username: 'company-librarian',
    icon_emoji: ':teacher:',
    text
  })
}
