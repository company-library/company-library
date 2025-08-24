import { type DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended'
import type { PrismaClient } from '@/generated/prisma/client'

import prisma from '@/libs/prisma/client'

vi.mock('@/libs/prisma/client', () => ({
  default: mockDeep<PrismaClient>(),
}))

afterEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
