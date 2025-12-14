import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  const adapter = new PrismaPg({});
  prisma = new PrismaClient({ adapter });
} else {
  // @ts-expect-error
  if (!global.prisma) {
    const adapter = new PrismaPg({});
    // @ts-expect-error
    global.prisma = new PrismaClient({ adapter });
  }
  // @ts-expect-error
  prisma = global.prisma;
}

export default prisma;
