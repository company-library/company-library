import Image from 'next/image'
import { FC } from 'react'
import { getAvatarUrl } from '@/libs/gravatar/getAvatarUrl'

type UserAvatarProps = {
  user: {
    name: string
    email: string
  }
  size?: Size
}

const UserAvatar: FC<UserAvatarProps> = async ({ user, size = 'md' }) => {
  const imageUrl = await getAvatarUrl(user.email)
  const width = getWidth(size)

  return (
    <div className="tooltip" data-tip={user.name} data-testid="name-tooltip">
      {imageUrl ? (
        <div className="avatar">
          <div className={`${width}`}>
            <Image
              src={imageUrl}
              alt={`${user.name}のプロフィール画像`}
              fill={true}
              className="rounded-full"
              data-testid="profileImage"
            />
          </div>
        </div>
      ) : (
        <div className="avatar placeholder">
          <div className={`${width} rounded-full bg-neutral text-neutral-content`}>
            <span>{user.name.substring(0, 1)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserAvatar

type Size =
  | 'sm' // w-8
  | 'md' // w-12
  | 'lg' // w-16
const getWidth = (size: Size) => {
  switch (size) {
    case 'sm':
      return 'w-8'
    case 'md':
      return 'w-12'
    case 'lg':
      return 'w-16'
    default:
      return ''
  }
}
