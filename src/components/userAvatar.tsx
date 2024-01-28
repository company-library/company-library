import Image from 'next/image'
import { FC } from 'react'
import { getAvatarUrl } from '@/libs/gravatar/getAvatarUrl'

type UserAvatarProps = {
  user: {
    name: string
    email: string
  }
}

const UserAvatar: FC<UserAvatarProps> = async ({ user }) => {
  const imageUrl = await getAvatarUrl(user.email)

  return (
    <div className="tooltip" data-tip={user.name} data-testid="name-tooltip">
      {imageUrl ? (
        <div className="avatar">
          <div className="w-12 rounded-full">
            <Image
              src={imageUrl}
              alt={`${user.name}のプロフィール画像`}
              width="48"
              height="48"
              data-testid="profileImage"
            />
          </div>
        </div>
      ) : (
        <div className="avatar placeholder">
          <div className="w-12 rounded-full bg-neutral text-neutral-content">
            <span>{user.name.substring(0, 1)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserAvatar
