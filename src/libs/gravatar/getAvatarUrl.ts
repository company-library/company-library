import crypto from 'crypto'

export const getAvatarUrl = async (email: string) => {
  const hash = getGravatarHash(email)
  const requestUrl = `https://gravatar.com/avatar/${hash}.jpg`

  const resp = await fetch(`${requestUrl}?d=404`).catch((e) => {
    console.error('gravatar fetch failed', e)
    return new Error('gravatar fetch failed')
  })

  if (resp instanceof Error || !resp.ok) {
    return undefined
  }

  return `${requestUrl}?d=mp`
}

const getGravatarHash = (email: string) => {
  return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex')
}
