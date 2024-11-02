import UserAvatar from '@/components/userAvatar'
import prisma from '@/libs/prisma/client'
import { formatDate } from '@/libs/luxon/utils'
import { getCustomUser } from '@/libs/next-auth/utils'
import type { Impression } from '@/models/book'
import type { CustomUser } from '@/models/user'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { useState } from 'react'
import EditReviewModal from './editReviewModal'

const ImpressionList = async ({ bookId }: { bookId: number }) => {
  const session = await getServerSession()
  const customUser = getCustomUser(session)
  if (!customUser) {
    notFound()
  }

  const impressions = await prisma.impression
    .findMany({
      where: { bookId },
      orderBy: [{ updatedAt: 'desc' }],
      include: { user: true },
    })
    .catch((e) => {
      console.error(e)
      return new Error('Impression fetch failed')
    })

  if (impressions instanceof Error) {
    return <div>感想の取得に失敗しました。再読み込みしてみてください。</div>
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImpression, setSelectedImpression] = useState<Impression | null>(null)

  const handleEditClick = (impression: Impression) => {
    setSelectedImpression(impression)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedImpression(null)
  }

  return (
    <>
      <div>
        {impressions.length === 0 ? (
          <div>現在登録されている感想はありません</div>
        ) : (
          impressions.map((impression, index) => (
            <div key={impression.id} className="mb-4">
              <div className="flex items-center mb-2">
                <UserAvatar user={impression.user} />
                <div className="ml-2">
                  <div data-testid={`postedUser-${index}`}>{impression.user.name}</div>
                  <div data-testid={`postedDate-${index}`}>{formatDate(impression.updatedAt)}</div>
                </div>
                {impression.user.id === customUser.id && (
                  <button
                    className="ml-auto bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => handleEditClick(impression)}
                  >
                    感想を編集
                  </button>
                )}
              </div>
              <div data-testid={`impression-${index}`} className="whitespace-pre-wrap">
                {impression.impression}
              </div>
            </div>
          ))
        )}
      </div>
      {selectedImpression && (
        <EditReviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          impression={selectedImpression}
        />
      )}
    </>
  )
}

export default ImpressionList
