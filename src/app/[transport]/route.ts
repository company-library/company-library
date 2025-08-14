import { createMcpHandler } from '@vercel/mcp-adapter'
import { z } from 'zod'

const schema = z.object({
  sides: z.number().min(1).max(100).default(6).describe('サイコロの面の数'),
})

type Schema = z.infer<typeof schema>

const handler = createMcpHandler((server) => {
  server.tool(
    // ツールの名前
    'dice_roll',
    // ツールの説明
    'サイコロを振った結果を返します',
    // ツールの引数のスキーマ
    schema,
    // ツールの実行関数
    async ({ sides }: Schema) => {
      // サイコロを振る
      const result = Math.floor(Math.random() * sides) + 1
      // 結果を返す
      return {
        content: [{ type: 'text', text: `🎲 You rolled a ${result}!` }],
      }
    },
  )
})

export { handler as GET, handler as POST, handler as DELETE }
