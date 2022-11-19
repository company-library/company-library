import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { User, isUser } from '@/models/user'

export const useCustomUser = () => {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | undefined>(undefined)

  useEffect(() => {
    switch (status) {
      case 'authenticated':
        if (session && isUser(session.customUser)) {
          setUser(session.customUser)
        }
        break
    }
  }, [status, session])

  return { user }
}
