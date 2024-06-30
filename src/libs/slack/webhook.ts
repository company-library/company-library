import { IncomingWebhook } from '@slack/webhook'
import process from 'process'

/**
 * Slack通知を行う
 * @param {string} text
 * @returns {Promise<void>}
 */
export const notifySlack = async (text: string) => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    console.info('SLACK_WEBHOOK_URL is not set in the environment variable')
    return
  }

  const webhook = new IncomingWebhook(webhookUrl)

  await webhook.send({
    username: 'company-librarian',
    icon_emoji: ':teacher:',
    text,
  })
}
