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
        <Image
          src={user.imageUrl}
          alt={`${user.name}のプロフィール画像`}
          width="60"
          height="60"
          className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"
          data-testid="profileImage"
        />
      ) : (
        <div className="flex items-center space-x-3">
          <div className="avatar placeholder">
            <div className="bg-neutral-focus text-neutral-content rounded-full w-[60px]">
              <span>{user.name.substring(0, 1)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserAvatar
