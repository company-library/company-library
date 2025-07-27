/**
 * server側で実行されるコードのため、テスト環境をnodeに変更する
 * https://stackoverflow.com/questions/76379428/how-to-test-nextjs-app-router-api-route-with-jest
 * @jest-environment node
 */

import type { NextRequest } from 'next/server'
import { GET } from '@/app/api/cron/overdue/route'
import { book1, book2 } from '../../../../../test/__utils__/data/book'
import { lendingHistory1, lendingHistory2 } from '../../../../../test/__utils__/data/lendingHistory'
import { user1, user2 } from '../../../../../test/__utils__/data/user'
import { prismaMock } from '../../../../../test/__utils__/libs/prisma/singleton'

describe('overdue cron api', () => {
  vi.stubEnv('SLACK_WEBHOOK_URL', 'slackWebhookUrl')
  vi.stubEnv('CRON_SECRET', 'dXx6fUmotuR15zpqfQqc')
  vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'localhost:3000')

  const { notifySlackMock } = vi.hoisted(() => ({
    notifySlackMock: vi.fn(),
  }))
  vi.mock('@/libs/slack/webhook', () => ({
    notifySlack: notifySlackMock,
  }))
  const consoleErrorSpy = vi.spyOn(console, 'error')

  const req = new Request('http://localhost:3000', {
    headers: [['authorization', 'Bearer dXx6fUmotuR15zpqfQqc']],
  }) as NextRequest

  it('authorization ヘッダーが Bearer CRON_SECRET ではない場合、401を返す', async () => {
    const notAuthReq = new Request('http://localhost:3000', {
      headers: [['authorization', 'Bearer abc']],
    }) as NextRequest

    const result = await GET(notAuthReq)

    expect(result.status).toBe(401)
    expect(await result.text()).toBe('Unauthorized')
  })

  it('DB取得時にエラーが発生した場合、500を返す', async () => {
    consoleErrorSpy.mockImplementationOnce(() => {})
    const expectedError = new Error('database error')
    prismaMock.lendingHistory.findMany.mockRejectedValueOnce(expectedError)

    const result = await GET(req)

    expect(result.status).toBe(500)
    expect(await result.text()).toBe('Internal Server Error')
    expect(consoleErrorSpy).toHaveBeenLastCalledWith(expectedError)
  })

  it('未返却かつ返却期限が実行日より前　の貸出履歴を 貸出日の照準 で取得する', async () => {
    vi.useFakeTimers()
    const nowDate = new Date(2024, 6, 7, 13)
    vi.setSystemTime(nowDate)
    prismaMock.lendingHistory.findMany.mockResolvedValueOnce([])

    const result = await GET(req)
    expect(result.status).toBe(200)

    expect(prismaMock.lendingHistory.findMany).toHaveBeenLastCalledWith({
      where: {
        returnHistory: null,
        dueDate: { lt: nowDate },
      },
      include: { book: true, user: true },
      orderBy: [{ lentAt: 'asc' }],
    })

    vi.useRealTimers()
  })

  it('対象の書籍が0件の場合、通知せずに、200を返す', async () => {
    prismaMock.lendingHistory.findMany.mockResolvedValueOnce([])

    const result = await GET(req)

    expect(result.status).toBe(200)
    expect(await result.json()).toStrictEqual({
      success: true,
      count: 0,
    })
  })

  it('対象の書籍が0件ではない場合、Slack通知して、200を返す', async () => {
    prismaMock.lendingHistory.findMany.mockResolvedValueOnce([
      {
        ...lendingHistory1,
        // @ts-expect-error
        book: book1,
        user: user1,
      },
      {
        ...lendingHistory2,
        userId: user2.id,
        // @ts-expect-error
        book: book2,
        user: user2,
      },
    ])

    const result = await GET(req)

    expect(result.status).toBe(200)
    expect(await result.json()).toStrictEqual({
      success: true,
      count: 2,
    })
    expect(notifySlackMock).toHaveBeenLastCalledWith('', [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '返却予定日を過ぎている書籍があります。読み終えていたら返却をお願いします。',
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<https://localhost:3000/books/${book1.id}|${book1.title}>*\n${user1.name} さん\n:calendar: 2020/02/01`,
        },
        accessory: {
          type: 'image',
          image_url: book1.imageUrl,
          alt_text: book1.title,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*<https://localhost:3000/books/${book2.id}|${book2.title}>*\n${user2.name} さん\n:calendar: 2020/02/02`,
        },
        accessory: {
          type: 'image',
          image_url: book2.imageUrl,
          alt_text: book2.title,
        },
      },
      {
        type: 'divider',
      },
    ])
  })
})
