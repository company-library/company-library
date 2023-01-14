import { IncomingWebhook } from '@slack/webhook'

const registerNotification = async (title: string) => {
  const url = process.env.SLACK_WEBHOOK_URL

  if (!url) {
    return
  }

  const webhook = new IncomingWebhook(url)
  await webhook.send({
    text: `「${title}」が追加されました`
  })
}

export default registerNotification
