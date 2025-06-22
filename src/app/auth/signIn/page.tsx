'use client'

import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { SessionProvider, signIn, useSession } from 'next-auth/react'
import { useEffect } from 'react'

const defaultProvider = process.env.NEXT_PUBLIC_DEFAULT_PROVIDER ?? ''

const SignIn: NextPage = () => {
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    const f = async () => {
      if (status === 'unauthenticated') {
        await signIn(defaultProvider)
      } else if (status === 'authenticated') {
        await router.push('/')
      }
    }

    f()
  }, [router, status])

  return <div />
}

const WrappedSignIn: NextPage = () => {
  return (
    <SessionProvider>
      <SignIn />
    </SessionProvider>
  )
}

export default WrappedSignIn
