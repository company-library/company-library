import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

const connectionString = `${process.env.POSTGRES_PRISMA_URL}`

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  const adapter = new PrismaPg({ connectionString })
  prisma = new PrismaClient({ adapter })
} else {
  // @ts-expect-error
  if (!global.prisma) {
    const adapter = new PrismaPg({ connectionString })
    // @ts-expect-error
    global.prisma = new PrismaClient({ adapter })
  }
  // @ts-expect-error
  prisma = global.prisma
}

export default prisma
