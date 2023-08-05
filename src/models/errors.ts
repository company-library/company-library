export type CustomError = {
  errorCode: string
  message: string
}

export const isCustomError = (arg: any): arg is CustomError => {
  return 'errorCode' in arg && 'message' in arg
}
