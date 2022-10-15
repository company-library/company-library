import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { CustomUser, isCustomUser } from '@/models/customUser'

export const useCustomUser = () => {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<CustomUser | undefined>(undefined)

  useEffect(() => {
    switch (status) {
      case 'authenticated':
        if (session && isCustomUser(session.customUser)) {
          setUser(session.customUser)
        }
        break
    }
  }, [status, session])

  return { user }
}
