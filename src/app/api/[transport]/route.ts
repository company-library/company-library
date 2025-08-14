import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

const handler = createMcpHandler((server) => {
  server.tool(
    // ツールの名前
    'dice_roll',
    // ツールの説明
    'サイコロを振った結果を返します',
    // ツールの引数のスキーマ
    {
      sides: z.number().min(1).max(100).default(6).describe('サイコロの面の数'),
    },
    // ツールの実行関数
    async ({ sides }) => {
      // サイコロを振る
      const result = Math.floor(Math.random() * sides) + 1
      // 結果を返す
      return {
        content: [{ type: 'text', text: `🎲 You rolled a ${result}!` }],
      }
    },
  )
})

export { handler as GET, handler as POST }
