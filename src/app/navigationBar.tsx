import { getServerSession } from 'next-auth'
import type { FC } from 'react'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import NavigationBarClient from '@/app/navigationBarClient'

const NavigationBar: FC = async () => {
  const session = await getServerSession(authOptions)
  const user = session?.customUser || null

  return <NavigationBarClient user={user} />
}

export default NavigationBar
