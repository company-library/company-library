'use server'

import prisma from '@/libs/prisma/client'
import { redirect } from 'next/navigation'

/**
 * 書籍の感想を更新するServer Action
 * @param {number} impressionId
 * @param {string} impression
 * @returns {Promise<void>}
 */
export const updateImpression = async (impressionId: number, impression: string): Promise<void> => {
  await prisma.impression
    .update({
      where: { id: impressionId },
      data: { impression },
    })
    .catch((e) => {
      console.error(e)
      throw new Error('Impression update failed')
    })
}
