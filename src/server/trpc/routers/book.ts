import { TRPCError } from '@trpc/server'
import * as z from 'zod/v4'
import prisma from '@/libs/prisma/client'
import { protectedProcedure, router } from '@/server/trpc/init'

export const bookRouter = router({
  /** タイトル・概要のキーワードと保管場所で書籍を検索する */
  search: protectedProcedure
    .input(
      z.object({
        q: z.string().default(''),
        locationId: z.number().int().optional(),
      }),
    )
    .query(async ({ input }) => {
      const books = await prisma.book
        .findMany({
          where: {
            // キーワード検索
            OR: [
              { title: { contains: input.q, mode: 'insensitive' } },
              { description: { contains: input.q, mode: 'insensitive' } },
            ],

            // 保管場所
            registrationHistories: {
              some: {
                location: {
                  id: input.locationId,
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
        .catch((e) => {
          console.error(e)
          return new Error('Book fetch failed')
        })

      if (books instanceof Error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: books.message })
      }

      return books
    }),

  /** ISBNで登録済みの書籍を取得する（未登録の場合はnull） */
  searchByIsbn: protectedProcedure
    .input(z.object({ isbn: z.string() }))
    .query(async ({ input }) => {
      const book = await prisma.book
        .findUnique({
          where: { isbn: input.isbn },
          include: {
            _count: {
              select: { registrationHistories: true },
            },
          },
        })
        .catch((e) => {
          console.error(e)
          return new Error('Book fetch failed')
        })

      if (book instanceof Error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: book.message })
      }

      return book
    }),
})
