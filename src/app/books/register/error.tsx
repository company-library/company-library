'use client' // Error boundaries must be Client Components

export default function ErrorPage({
  _error,
}: {
  _error: Error & { digest?: string }
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <span>
        Try again
      </span>
    </div>
  )
}
