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

    // 人気書籍ランキングツール
    server.tool(
      'get_popular_books',
      '貸出回数に基づく人気書籍ランキングを取得します',
      {
        limit: z.number().min(1).max(50).default(10).describe('取得する書籍数'),
        period: z.enum(['all', 'month', 'year']).default('all').describe('集計期間 (all: 全期間, month: 過去1ヶ月, year: 過去1年)'),
      },
      async ({ limit, period }) => {
        try {
          let dateFilter = {}
          const now = new Date()
          
          if (period === 'month') {
            const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
            dateFilter = { lentAt: { gte: oneMonthAgo } }
          } else if (period === 'year') {
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
            dateFilter = { lentAt: { gte: oneYearAgo } }
          }

          const popularBooks = await prisma.book.findMany({
            select: {
              id: true,
              title: true,
              isbn: true,
              imageUrl: true,
              lendingHistories: {
                where: dateFilter,
                select: {
                  id: true,
                  lentAt: true,
                },
              },
              impressions: {
                select: {
                  impression: true,
                },
              },
              _count: {
                select: {
                  lendingHistories: true,
                },
              },
            },
            orderBy: {
              lendingHistories: {
                _count: 'desc',
              },
            },
            take: limit,
          })

          if (popularBooks.length === 0) {
            return {
              content: [{ type: 'text', text: '📊 指定した期間の貸出データがありません' }],
            }
          }

          const periodText = period === 'all' ? '全期間' : period === 'month' ? '過去1ヶ月' : '過去1年'
          
          const rankingText = popularBooks
            .filter(book => book.lendingHistories.length > 0)
            .map((book, index) => {
              const rank = index + 1
              const lendingCount = book.lendingHistories.length
              const totalLendingCount = book._count.lendingHistories
              const impressionCount = book.impressions.length
              
              return `${rank}位. **${book.title}**
   - 貸出回数: ${lendingCount}回 (累計: ${totalLendingCount}回)
   - 感想数: ${impressionCount}件
   - ISBN: ${book.isbn}`
            }).join('\n\n')

          const result = `📊 人気書籍ランキング (${periodText})

${rankingText || '該当する書籍がありません'}`

          return {
            content: [{ type: 'text', text: result }],
          }
        } catch (error) {
          console.error('人気書籍ランキング取得エラー:', error)
          return {
            content: [{ type: 'text', text: '❌ ランキング情報の取得中にエラーが発生しました' }],
          }
        }
      },
    )

    // 貸出統計ツール
    server.tool(
      'get_lending_statistics',
      '貸出に関する統計情報を取得します（月別、ユーザー別、場所別など）',
      {
        type: z.enum(['monthly', 'user', 'location', 'overdue']).default('monthly').describe('統計の種類'),
        period: z.number().min(1).max(24).default(12).describe('過去何ヶ月分のデータを取得するか'),
        limit: z.number().min(5).max(50).default(10).describe('ユーザー・場所別統計での表示件数'),
      },
      async ({ type, period, limit }) => {
        try {
          const now = new Date()
          const startDate = new Date(now.getFullYear(), now.getMonth() - period, 1)

          if (type === 'monthly') {
            const monthlyStats = await prisma.$queryRaw`
              SELECT 
                DATE_TRUNC('month', lent_at) as month,
                COUNT(*) as lending_count,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(DISTINCT book_id) as unique_books
              FROM lending_histories
              WHERE lent_at >= ${startDate}
              GROUP BY DATE_TRUNC('month', lent_at)
              ORDER BY month DESC
            ` as Array<{
              month: Date
              lending_count: bigint
              unique_users: bigint
              unique_books: bigint
            }>

            const statsText = monthlyStats.map(stat => {
              const month = new Date(stat.month).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
              return `**${month}**
   - 貸出数: ${stat.lending_count}件
   - 利用者数: ${stat.unique_users}人
   - 利用書籍数: ${stat.unique_books}冊`
            }).join('\n\n')

            return {
              content: [{ type: 'text', text: `📈 月別貸出統計 (過去${period}ヶ月)\n\n${statsText}` }],
            }

          } else if (type === 'user') {
            const userStats = await prisma.user.findMany({
              select: {
                name: true,
                email: true,
                lendingHistories: {
                  where: { lentAt: { gte: startDate } },
                  select: { id: true },
                },
                _count: {
                  select: {
                    lendingHistories: true,
                  },
                },
              },
              orderBy: {
                lendingHistories: { _count: 'desc' },
              },
              take: limit,
            })

            const userStatsText = userStats
              .filter(user => user.lendingHistories.length > 0)
              .map((user, index) => {
                const rank = index + 1
                const recentCount = user.lendingHistories.length
                const totalCount = user._count.lendingHistories
                return `${rank}位. **${user.name}**
   - 過去${period}ヶ月: ${recentCount}冊
   - 累計: ${totalCount}冊`
              }).join('\n\n')

            return {
              content: [{ type: 'text', text: `👥 ユーザー別貸出統計 (過去${period}ヶ月, トップ${limit})\n\n${userStatsText}` }],
            }

          } else if (type === 'location') {
            const locationStats = await prisma.location.findMany({
              select: {
                name: true,
                lendingHistories: {
                  where: { lentAt: { gte: startDate } },
                  select: { id: true },
                },
                registrationHistories: {
                  select: { id: true },
                },
              },
              orderBy: {
                lendingHistories: { _count: 'desc' },
              },
            })

            const locationStatsText = locationStats.map((location, index) => {
              const rank = index + 1
              const lendingCount = location.lendingHistories.length
              const totalBooks = location.registrationHistories.length
              const utilizationRate = totalBooks > 0 ? ((lendingCount / totalBooks) * 100).toFixed(1) : '0.0'
              
              return `${rank}位. **${location.name}**
   - 貸出数: ${lendingCount}件
   - 所蔵数: ${totalBooks}冊
   - 利用率: ${utilizationRate}%`
            }).join('\n\n')

            return {
              content: [{ type: 'text', text: `📍 場所別貸出統計 (過去${period}ヶ月)\n\n${locationStatsText}` }],
            }

          } else if (type === 'overdue') {
            const overdueBooks = await prisma.lendingHistory.findMany({
              where: {
                returnHistory: null,
                dueDate: { lt: now },
              },
              include: {
                book: {
                  select: { title: true, isbn: true },
                },
                user: {
                  select: { name: true, email: true },
                },
                location: {
                  select: { name: true },
                },
              },
              orderBy: { dueDate: 'asc' },
            })

            if (overdueBooks.length === 0) {
              return {
                content: [{ type: 'text', text: '✅ 現在、返却期限を過ぎた書籍はありません' }],
              }
            }

            const overdueText = overdueBooks.map(lending => {
              const overdueDays = Math.ceil((now.getTime() - lending.dueDate.getTime()) / (1000 * 60 * 60 * 24))
              return `📕 **${lending.book.title}**
   - 借用者: ${lending.user.name}
   - 場所: ${lending.location?.name || '不明'}
   - 期限: ${lending.dueDate.toLocaleDateString('ja-JP')}
   - 延滞日数: ${overdueDays}日`
            }).join('\n\n')

            return {
              content: [{ type: 'text', text: `⚠️  返却期限超過書籍 (${overdueBooks.length}件)\n\n${overdueText}` }],
            }
          }

          return {
            content: [{ type: 'text', text: '❌ 不正な統計タイプが指定されました' }],
          }
        } catch (error) {
          console.error('貸出統計取得エラー:', error)
          return {
            content: [{ type: 'text', text: '❌ 統計情報の取得中にエラーが発生しました' }],
          }
        }
      },
    )

    // 図書館ダッシュボードツール
    server.tool(
      'get_library_dashboard',
      '図書館の全体的な状況を一覧表示します（総合ダッシュボード）',
      {},
      async () => {
        try {
          const now = new Date()
          const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

          // 基本統計
          const [
            totalBooks,
            totalUsers,
            currentLendings,
            monthlyLendings,
            totalReservations,
            overdueCount,
          ] = await Promise.all([
            prisma.book.count(),
            prisma.user.count(),
            prisma.lendingHistory.count({ where: { returnHistory: null } }),
            prisma.lendingHistory.count({ where: { lentAt: { gte: oneMonthAgo } } }),
            prisma.reservation.count(),
            prisma.lendingHistory.count({
              where: {
                returnHistory: null,
                dueDate: { lt: now },
              },
            }),
          ])

          // 場所別統計
          const locationStats = await prisma.location.findMany({
            select: {
              name: true,
              registrationHistories: { select: { id: true } },
              lendingHistories: {
                where: { returnHistory: null },
                select: { id: true },
              },
            },
          })

          // 人気書籍トップ3
          const topBooks = await prisma.book.findMany({
            select: {
              title: true,
              _count: { select: { lendingHistories: true } },
            },
            orderBy: {
              lendingHistories: { _count: 'desc' },
            },
            take: 3,
          })

          // アクティブユーザートップ3
          const activeUsers = await prisma.user.findMany({
            select: {
              name: true,
              lendingHistories: {
                where: { lentAt: { gte: oneMonthAgo } },
                select: { id: true },
              },
            },
            orderBy: {
              lendingHistories: { _count: 'desc' },
            },
            take: 3,
          })

          const locationStatsText = locationStats.map(location => {
            const totalCount = location.registrationHistories.length
            const lendingCount = location.lendingHistories.length
            const availableCount = totalCount - lendingCount
            const utilizationRate = totalCount > 0 ? ((lendingCount / totalCount) * 100).toFixed(1) : '0.0'
            
            return `  • ${location.name}: ${availableCount}冊利用可能 / ${totalCount}冊 (利用率: ${utilizationRate}%)`
          }).join('\n')

          const topBooksText = topBooks
            .filter(book => book._count.lendingHistories > 0)
            .map((book, index) => `  ${index + 1}. ${book.title} (${book._count.lendingHistories}回)`)
            .join('\n') || '  データなし'

          const activeUsersText = activeUsers
            .filter(user => user.lendingHistories.length > 0)
            .map((user, index) => `  ${index + 1}. ${user.name} (${user.lendingHistories.length}冊)`)
            .join('\n') || '  データなし'

          const utilizationRate = totalBooks > 0 ? ((currentLendings / totalBooks) * 100).toFixed(1) : '0.0'

          const result = `📊 図書館ダッシュボード

**📚 基本統計**
• 総書籍数: ${totalBooks}冊
• 登録ユーザー数: ${totalUsers}人
• 現在貸出中: ${currentLendings}冊 (利用率: ${utilizationRate}%)
• 今月の貸出数: ${monthlyLendings}件
• 予約数: ${totalReservations}件
${overdueCount > 0 ? `• ⚠️ 返却期限超過: ${overdueCount}件` : '• ✅ 期限超過なし'}

**📍 場所別在庫状況**
${locationStatsText}

**🏆 人気書籍 トップ3**
${topBooksText}

**👥 今月のアクティブユーザー トップ3**
${activeUsersText}

**📈 システム状況**
• 全体利用率: ${utilizationRate}%
• 月間利用者: ${activeUsers.filter(u => u.lendingHistories.length > 0).length}人
${overdueCount > 0 ? `• 要注意: ${overdueCount}件の期限超過あり` : '• 正常: 期限超過なし'}`

          return {
            content: [{ type: 'text', text: result }],
          }
        } catch (error) {
          console.error('ダッシュボード取得エラー:', error)
          return {
            content: [{ type: 'text', text: '❌ ダッシュボード情報の取得中にエラーが発生しました' }],
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
