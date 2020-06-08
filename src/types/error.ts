interface ResponseError {
  message: string
  code?: number
  name: string
  data?: unknown[]
}

interface ApiError {
  name: string
  message: string
  code: number
  data: unknown[]
}

export {ResponseError, ApiError}