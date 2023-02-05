import { NextApiRequest, NextApiResponse } from 'next'
import { sdk } from '@/libs/graphql-codegen/sdk'
import { getToken } from 'next-auth/jwt'
import { callWebhook, getWebhookUrl } from '@/libs/slack/webhook'

/**
 * Slackへの書籍登録通知を行うAPI
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req })
  if (!token) {
    return res.status(403)
  }

  const maybeWebhookUrl = getWebhookUrl()

  if (!maybeWebhookUrl) {
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

  await callWebhook(maybeWebhookUrl,`「${book.books_by_pk.title}」という書籍が新しく登録されました` )

  return res.status(200).json('Called slack webhook')
}

export default handler
