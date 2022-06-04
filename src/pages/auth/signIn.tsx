import { signIn, useSession } from 'next-auth/react'
import { NextPage } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const SignIn: NextPage = () => {
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    const f = async () => {
      if (status === 'unauthenticated') {
        await signIn('azure-ad-b2c')
      } else if (status === 'authenticated') {
        await router.push('/')
      }
    }

    f()
  }, [router, status])

  return <div />
}

export default SignIn
