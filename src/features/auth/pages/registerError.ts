import { getApiErrorDetails } from '@/utils/apiError'

type RegisterErrorMessages = {
  fallback: string
  phoneAlreadyInUse: string
}

export const resolveRegisterSubmitErrorMessage = (
  error: unknown,
  messages: RegisterErrorMessages,
) => {
  const errorDetails = getApiErrorDetails(error)

  if (errorDetails.code === 'phone_already_in_use') {
    return messages.phoneAlreadyInUse
  }

  return errorDetails.message || messages.fallback
}
