import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import prisma from '@/libs/prisma/client'

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

    // 書籍詳細情報ツール
    server.tool(
      'get_book_details',
      '書籍IDまたはISBNから詳細情報を取得します（在庫状況、貸出状況、感想、統計情報を含む）',
      {
        bookId: z.number().optional().describe('書籍ID'),
        isbn: z.string().optional().describe('ISBN'),
      },
      async ({ bookId, isbn }) => {
        if (!bookId && !isbn) {
          return {
            content: [{ type: 'text', text: '❌ bookIdまたはisbnのいずれかを指定してください' }],
          }
        }

        try {
          // 書籍を検索
          const whereCondition = bookId ? { id: bookId } : { isbn: isbn }
          const book = await prisma.book.findUnique({
            where: whereCondition,
            include: {
              registrationHistories: {
                include: {
                  location: true,
                  user: {
                    select: { name: true, email: true },
                  },
                },
              },
              lendingHistories: {
                include: {
                  user: {
                    select: { name: true, email: true },
                  },
                  location: true,
                  returnHistory: true,
                },
              },
              impressions: {
                include: {
                  user: {
                    select: { name: true },
                  },
                },
                orderBy: { createdAt: 'desc' },
              },
              reservations: {
                include: {
                  user: {
                    select: { name: true, email: true },
                  },
                },
                orderBy: { createdAt: 'desc' },
              },
            },
          })

          if (!book) {
            return {
              content: [{ type: 'text', text: '❌ 指定された書籍が見つかりません' }],
            }
          }

          // 在庫統計の計算
          const locationStats = new Map()
          book.registrationHistories.forEach((reg) => {
            if (reg.location) {
              const locationId = reg.location.id
              const existing = locationStats.get(locationId) || {
                name: reg.location.name,
                totalCount: 0,
                lendingCount: 0,
              }
              existing.totalCount += 1
              locationStats.set(locationId, existing)
            }
          })

          // 貸出中の統計
          book.lendingHistories.forEach((lending) => {
            if (!lending.returnHistory && lending.location) {
              const locationId = lending.location.id
              const existing = locationStats.get(locationId)
              if (existing) {
                existing.lendingCount += 1
              }
            }
          })

          // 結果をフォーマット
          const currentLendings = book.lendingHistories.filter((l) => !l.returnHistory)
          const pastLendings = book.lendingHistories.filter((l) => l.returnHistory)
          
          const locationInfo = Array.from(locationStats.entries()).map(([locationId, stats]) => {
            const lendableCount = stats.totalCount - stats.lendingCount
            return `${stats.name}: ${lendableCount}冊利用可能 (所蔵: ${stats.totalCount}冊, 貸出中: ${stats.lendingCount}冊)`
          }).join('\\n')

          const currentLendingInfo = currentLendings.length > 0 
            ? currentLendings.map(l => `- ${l.user.name} (期限: ${new Date(l.dueDate).toLocaleDateString('ja-JP')})`).join('\\n')
            : 'なし'

          const impressionInfo = book.impressions.length > 0
            ? book.impressions.slice(0, 5).map(i => `- ${i.user.name}: "${i.impression.substring(0, 50)}${i.impression.length > 50 ? '...' : ''}"`).join('\\n')
            : 'なし'

          const reservationInfo = book.reservations.length > 0
            ? book.reservations.map(r => `- ${r.user.name} (予約日: ${new Date(r.reservationDate).toLocaleDateString('ja-JP')})`).join('\\n')
            : 'なし'

          const totalLendingCount = book.lendingHistories.length
          const totalReturnCount = pastLendings.length

          const result = `📚 書籍詳細情報

**基本情報**
- タイトル: ${book.title}
- ISBN: ${book.isbn}
- 説明: ${book.description || 'なし'}
- 登録日: ${new Date(book.createdAt).toLocaleDateString('ja-JP')}

**在庫状況**
${locationInfo}

**現在の貸出状況**
${currentLendingInfo}

**予約状況**
予約数: ${book.reservations.length}件
${reservationInfo}

**利用統計**
- 累計貸出回数: ${totalLendingCount}回
- 累計返却回数: ${totalReturnCount}回
- 感想数: ${book.impressions.length}件

**最新の感想 (最大5件)**
${impressionInfo}`

          return {
            content: [{ type: 'text', text: result }],
          }
        } catch (error) {
          console.error('書籍詳細取得エラー:', error)
          return {
            content: [{ type: 'text', text: '❌ 書籍詳細情報の取得中にエラーが発生しました' }],
          }
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
