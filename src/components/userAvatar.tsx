import Image from 'next/image'
import { FC } from 'react'

type UserAvatarProps = {
  user: {
    name: string
    imageUrl?: string | null
  }
}

const UserAvatar: FC<UserAvatarProps> = ({ user }) => {
  return (
    <div className="tooltip" data-tip={user.name} data-testid="name-tooltip">
      {user.imageUrl ? (
        <div className="avatar">
          <div className="w-12 rounded-full">
            <Image
              src={user.imageUrl}
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
