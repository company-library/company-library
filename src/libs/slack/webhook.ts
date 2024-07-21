import type { Block, KnownBlock } from '@slack/types'
import { IncomingWebhook } from '@slack/webhook'

/**
 * Slack通知を行う
 * @param {string} text
 * @param {(KnownBlock | Block)[]} blocks textより優先されます
 * @returns {Promise<void>}
 */
export const notifySlack = async (text: string, blocks?: (KnownBlock | Block)[]): Promise<void> => {
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
    blocks,
  })
}
