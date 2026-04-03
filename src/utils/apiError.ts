type ErrorResponsePayload = {
  attemptNumber?: number
  captchaRequired?: boolean
  code?: string
  message?: string | string[]
  error?: string
  detail?: string
  rateLimitScope?: 'ip' | 'phone' | 'session'
  retryAfterSeconds?: number
}

const normalizeMessage = (message?: string | string[]): string | null => {
  if (!message) return null

  if (Array.isArray(message)) {
    return message.filter(Boolean).join(', ') || null
  }

  return message
}

const getErrorResponsePayload = (error: unknown): ErrorResponsePayload | null => {
  if (!error || typeof error !== 'object') {
    return null
  }

  if ('response' in error) {
    const response = (error as { response?: { data?: ErrorResponsePayload } }).response
    if (response?.data) {
      return response.data
    }
  }

  if ('data' in error) {
    const data = (error as { data?: ErrorResponsePayload }).data
    if (data) {
      return data
    }
  }

  return null
}

export interface ApiErrorDetails {
  attemptNumber?: number
  captchaRequired?: boolean
  code?: string
  message: string | null
  rateLimitScope?: 'ip' | 'phone' | 'session'
  retryAfterSeconds?: number
}

export const getApiErrorDetails = (error: unknown): ApiErrorDetails => {
  const responseData = getErrorResponsePayload(error)
  const message =
    normalizeMessage(responseData?.message) ??
    responseData?.error ??
    responseData?.detail ??
    (error instanceof Error && error.message ? error.message : null)

  return {
    attemptNumber:
      typeof responseData?.attemptNumber === 'number' ? responseData.attemptNumber : undefined,
    captchaRequired:
      typeof responseData?.captchaRequired === 'boolean'
        ? responseData.captchaRequired
        : undefined,
    code: typeof responseData?.code === 'string' ? responseData.code : undefined,
    message,
    rateLimitScope: responseData?.rateLimitScope,
    retryAfterSeconds:
      typeof responseData?.retryAfterSeconds === 'number'
        ? responseData.retryAfterSeconds
        : undefined,
  }
}

export const getApiErrorMessage = (error: unknown): string | null => {
  const details = getApiErrorDetails(error)
  if (details.message) {
    return details.message
  }

  return null
}
