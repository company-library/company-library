export type CustomError = {
  errorCode: string
  message: string
}

export const isCustomError = (arg: unknown): arg is CustomError => {
  if (typeof arg !== 'object' || arg === null) {
    return false
  }

  const maybeCustomError = arg as { errorCode?: unknown; message?: unknown }
  return (
    typeof maybeCustomError.errorCode === 'string' && typeof maybeCustomError.message === 'string'
  )
}
