import { getServerSession } from 'next-auth'
import type { FC } from 'react'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import NavigationBarClient from '@/app/navigationBarClient'
import { getAvatarUrl } from '@/libs/gravatar/getAvatarUrl'

const NavigationBar: FC = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.customUser || null
  const avatarUrl = user ? await getAvatarUrl(user.email) : undefined

  return <NavigationBarClient user={user} avatarUrl={avatarUrl} />
}

export default NavigationBar
