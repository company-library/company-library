import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { OldUser, isOldUser } from '@/models/user'

export const useCustomUser = () => {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<OldUser | undefined>(undefined)

  useEffect(() => {
    switch (status) {
      case 'authenticated':
        if (session && isOldUser(session.customUser)) {
          setUser(session.customUser)
        }
        break
    }
  }, [status, session])

  return { user }
}
