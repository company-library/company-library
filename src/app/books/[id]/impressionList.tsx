import { useState } from 'react'
import { useSession } from 'next-auth/react'
import prisma from '@/libs/prisma/client'
import UserAvatar from '@/components/userAvatar'
import EditReviewModal from './editReviewModal'

type ImpressionListProps = {
  bookId: number
}

const ImpressionList = async ({ bookId }: ImpressionListProps) => {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImpression, setCurrentImpression] = useState('')
  const [impressions, setImpressions] = useState([])

  const fetchImpressions = async () => {
    const impressions = await prisma.impression.findMany({
      where: { bookId },
      orderBy: { updatedAt: 'desc' },
      include: { user: true },
    })
    setImpressions(impressions)
  }

  const handleEditClick = (impression: string) => {
    setCurrentImpression(impression)
    setIsModalOpen(true)
  }

  const handleSave = async (newImpression: string) => {
    // Save the edited impression to the database
    await prisma.impression.update({
      where: { id: currentImpression.id },
      data: { impression: newImpression },
    })
    setIsModalOpen(false)
    fetchImpressions()
  }

  return (
    <div>
      <h2>感想一覧</h2>
      {impressions.length === 0 ? (
        <p>現在登録されている感想はありません</p>
      ) : (
        impressions.map((impression, index) => (
          <div key={impression.id} className="mb-4">
            <div className="flex items-center mb-2">
              <UserAvatar user={impression.user} />
              <span className="ml-2">{impression.user.name}</span>
              <span className="ml-2 text-gray-500" data-testid={`postedDate-${index}`}>
                {new Date(impression.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <p className="whitespace-pre-wrap" data-testid={`impression-${index}`}>
              {impression.impression}
            </p>
            {impression.user.id === userId && (
              <button
                onClick={() => handleEditClick(impression)}
                className="text-blue-500 hover:underline"
              >
                感想を編集
              </button>
            )}
          </div>
        ))
      )}
      <EditReviewModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        currentImpression={currentImpression}
        onSave={handleSave}
      />
    </div>
  )
}

export default ImpressionList
