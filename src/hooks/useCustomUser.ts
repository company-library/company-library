import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { User, isCustomUser } from '@/models/user'

export const useCustomUser = () => {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | undefined>(undefined)

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
