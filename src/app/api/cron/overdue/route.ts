import type { NextRequest } from 'next/server'
import { toJstFormat } from '@/libs/luxon/utils'
import prisma from '@/libs/prisma/client'
import { notifySlack } from '@/libs/slack/webhook'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  const lendingHistories = await prisma.lendingHistory
    .findMany({
      where: {
        returnHistory: null,
        dueDate: { lt: new Date() },
      },
      include: { book: true, user: true },
      orderBy: [{ lentAt: 'asc' }],
    })
    .catch((e) => {
      console.error(e)
      return new Error('fetch failed')
    })
  if (lendingHistories instanceof Error) {
    return new Response('Internal Server Error', {
      status: 500,
    })
  }

  const count = lendingHistories.length
  if (count === 0) {
    return Response.json({ success: true, count: count })
  }

  const messageBlocks = lendingHistories.flatMap((h) => {
    const book = h.book
    const usr = h.user

    const bookDetailUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/books/${book.id}`

    return [
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<${bookDetailUrl}|${book.title}>*\n${usr.name} さん\n:calendar: ${toJstFormat(h.dueDate)}`,
        },
        accessory: {
          type: 'image',
          image_url: book.imageUrl,
          alt_text: book.title,
        },
      },
    ]
  })

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '返却予定日を過ぎている書籍があります。読み終えていたら返却をお願いします。',
      },
    },
    ...messageBlocks,
    {
      type: 'divider',
    },
  ]

  await notifySlack('', blocks)

  return Response.json({ success: true, count: count })
}
