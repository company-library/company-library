import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

const handler = createMcpHandler(
  (server) => {
    // サイコロツール
    server.tool(
      'dice_roll',
      'サイコロを振った結果を返します',
      {
        sides: z.number().min(1).max(100).default(6).describe('サイコロの面の数'),
      },
      async ({ sides }) => {
        const result = Math.floor(Math.random() * sides) + 1
        return {
          content: [{ type: 'text', text: `🎲 You rolled a ${result}!` }],
        }
      },
    )

    // コイントスツール
    server.tool(
      'coin_flip',
      'コインを投げて表か裏かを返します',
      {},
      async () => {
        const result = Math.random() < 0.5 ? '表' : '裏'
        return {
          content: [{ type: 'text', text: `🪙 コインの結果: ${result}` }],
        }
      },
    )

    // ランダム数値生成ツール
    server.tool(
      'random_number',
      '指定した範囲のランダムな数値を生成します',
      {
        min: z.number().default(1).describe('最小値'),
        max: z.number().default(100).describe('最大値'),
      },
      async ({ min, max }) => {
        const result = Math.floor(Math.random() * (max - min + 1)) + min
        return {
          content: [{ type: 'text', text: `🔢 ランダム数値 (${min}-${max}): ${result}` }],
        }
      },
    )

    // 現在時刻ツール
    server.tool(
      'current_time',
      '現在の日時を返します',
      {
        timezone: z.string().default('Asia/Tokyo').describe('タイムゾーン'),
      },
      async ({ timezone }) => {
        const now = new Date().toLocaleString('ja-JP', { timeZone: timezone })
        return {
          content: [{ type: 'text', text: `⏰ 現在時刻 (${timezone}): ${now}` }],
        }
      },
    )
  },
  {
    // Optional server options
  },
  {
    // Optional redis config
    redisUrl: process.env.REDIS_URL,
    basePath: '/api', // this needs to match where the [transport] is located.
    maxDuration: 60,
    verboseLogs: true,
  },
)

export { handler as GET, handler as POST }
