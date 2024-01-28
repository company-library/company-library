import process from 'process'
import { IncomingWebhook } from '@slack/webhook'

/**
 * Slackのwebhookをキックする関数
 * @param {string} text
 * @returns {Promise<void>}
 */
export const notifySlack = async (text: string) => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL is not set in the environment variable')
    return
  }

  const webhook = new IncomingWebhook(webhookUrl)

  await webhook.send({
    username: 'company-librarian',
    icon_emoji: ':teacher:',
    text
  })
}
