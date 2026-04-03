export const REGISTER_PHONE_AVAILABILITY_DEBOUNCE_MS = 700

export type RegisterPhoneAvailabilityStatus =
  | 'idle'
  | 'invalid'
  | 'checking'
  | 'available'
  | 'unavailable'
  | 'error'

type ShouldApplyRegisterPhoneAvailabilityResultInput = {
  currentPhone: string | null
  latestRequestId: number
  requestId: number
  requestedPhone: string
}

type RegisterPhoneAvailabilityMessages = {
  available: string
  checking: string
  error: string
  unavailable: string
}

export type RegisterPhoneAvailabilityFeedback = {
  error?: string
  helperText?: string
  indicator: 'checking' | 'none' | 'success'
}

export const shouldCheckRegisterPhoneAvailability = ({
  phoneDraft,
  resolvedPhone,
}: {
  phoneDraft: string
  resolvedPhone: string | null
}) => {
  return phoneDraft.trim() !== '' && Boolean(resolvedPhone)
}

export const shouldApplyRegisterPhoneAvailabilityResult = ({
  currentPhone,
  latestRequestId,
  requestId,
  requestedPhone,
}: ShouldApplyRegisterPhoneAvailabilityResultInput) => {
  return requestId === latestRequestId && requestedPhone === currentPhone
}

export const resolveRegisterPhoneAvailabilityFeedback = (
  status: RegisterPhoneAvailabilityStatus,
  messages: RegisterPhoneAvailabilityMessages,
): RegisterPhoneAvailabilityFeedback => {
  switch (status) {
    case 'checking':
      return {
        helperText: messages.checking,
        indicator: 'checking',
      }
    case 'available':
      return {
        helperText: messages.available,
        indicator: 'success',
      }
    case 'unavailable':
      return {
        error: messages.unavailable,
        indicator: 'none',
      }
    case 'error':
      return {
        error: messages.error,
        indicator: 'none',
      }
    default:
      return {
        indicator: 'none',
      }
  }
}
