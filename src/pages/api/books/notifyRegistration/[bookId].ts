import { NextApiRequest, NextApiResponse } from 'next'
import { sdk } from '@/libs/graphql-codegen/sdk'
import * as process from 'process'
import { IncomingWebhook } from '@slack/webhook'
import { getToken } from 'next-auth/jwt'

const bookId = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req })
  if (!token) {
    return res.status(403)
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    console.debug('SLACK_WEBHOOK_URL is not set in the environment variable')
    return res.status(200)
  }

  const reqBookId = Array.isArray(req.query.bookId) ? req.query.bookId[0] : req.query.bookId
  const bookId = Number.parseInt(reqBookId)
  if (Number.isNaN(bookId)) {
    return res.status(400)
  }

  const book = await sdk().getBookById({ id: bookId })
  if (!book.books_by_pk?.title) {
    return res.status(400)
  }

  const webhook = new IncomingWebhook(webhookUrl)

  await webhook.send({
    text: `「${book.books_by_pk.title}」という書籍が新しく登録されました`
  })

  return res.status(200).json('Called slack notification webhook')
}

export default bookId
