import Image from 'next/image'
import Link from 'next/link'
import type { FC } from 'react'
import { getAvatarUrl } from '@/libs/gravatar/getAvatarUrl'

type UserAvatarProps = {
  user: {
    name: string
    email: string
  }
  size?: Size
  tooltip?: Tooltip
  linkToProfile?: boolean
}

const UserAvatar: FC<UserAvatarProps> = async ({
  user,
  size = 'md',
  tooltip = 'none',
  linkToProfile = false,
}) => {
  const imageUrl = await getAvatarUrl(user.email)
  const width = getWidth(size)
  const tooltipPosition = getTooltipPosition(tooltip)

  const avatarContent = (
    <>
      {imageUrl ? (
        <div className="avatar">
          <div className={`${width} relative`} data-testid="width">
            <Image
              src={imageUrl}
              alt={`${user.name}のプロフィール画像`}
              fill={true}
              className="rounded-full"
              data-testid="profileImage"
              sizes={
                size === 'sm' ? '32px' : size === 'md' ? '48px' : size === 'lg' ? '64px' : '100vw'
              }
            />
          </div>
        </div>
      ) : (
        <div className="avatar avatar-placeholder">
          <div
            className={`${width} rounded-full bg-neutral text-neutral-content`}
            data-testid="width"
          >
            <span className="text-gray-200">{user.name.substring(0, 1)}</span>
          </div>
        </div>
      )}
    </>
  )

  return (
    <div className={`${tooltipPosition}`} data-tip={user.name} data-testid="name-tooltip">
      {linkToProfile ? (
        <Link href={`/users/${encodeURIComponent(user.email)}`}>{avatarContent}</Link>
      ) : (
        avatarContent
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

type Tooltip = 'none' | 'top' | 'bottom' | 'left' | 'right'
const getTooltipPosition = (tooltip: Tooltip) => {
  switch (tooltip) {
    case 'top':
      return 'tooltip tooltip-top'
    case 'bottom':
      return 'tooltip tooltip-bottom'
    case 'left':
      return 'tooltip tooltip-left'
    case 'right':
      return 'tooltip tooltip-right'
    default:
      return ''
  }
}
