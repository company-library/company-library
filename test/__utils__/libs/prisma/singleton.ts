import type { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended'

import prisma from '@/libs/prisma/client'

vi.mock('@/libs/prisma/client', () => ({
  default: mockDeep<PrismaClient>(),
}))

afterEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
