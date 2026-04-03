const E164_REGEX = /^\+[1-9]\d{1,14}$/
const PHONE_ALLOWED_CHARS_REGEX = /^[+\d\s().-]+$/
const PHONE_DRAFT_DIGIT_KEY_REGEX = /^\d$/
const PHONE_DRAFT_CONTROL_KEYS = new Set([
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'Backspace',
  'Delete',
  'End',
  'Enter',
  'Escape',
  'Home',
  'Tab',
])

export const PHONE_DRAFT_REGEX = /^\+?\d*$/
export const PHONE_DRAFT_HTML_PATTERN = '\\+?[0-9]*'

export const sanitizePhoneDigits = (value: unknown): string => {
  if (typeof value !== 'string') return ''

  return value.replace(/\D/g, '')
}

export const sanitizePhoneDraftInput = (value: unknown): string => {
  if (typeof value !== 'string') return ''

  const trimmedValue = value.trim()
  if (!trimmedValue) return ''

  if (PHONE_DRAFT_REGEX.test(trimmedValue)) {
    return trimmedValue
  }

  const hasLeadingPlus = trimmedValue.startsWith('+')
  const digits = sanitizePhoneDigits(trimmedValue)

  if (!digits) {
    return hasLeadingPlus ? '+' : ''
  }

  return hasLeadingPlus ? `+${digits}` : digits
}

export const isPhoneDraftInput = (value: unknown): value is string => {
  return typeof value === 'string' && PHONE_DRAFT_REGEX.test(value.trim())
}

interface PhoneDraftKeyValidationInput {
  currentValue?: string | null
  key: string
  selectionEnd?: number | null
  selectionStart?: number | null
}

export const isAllowedPhoneDraftKey = ({
  currentValue,
  key,
  selectionEnd,
  selectionStart,
}: PhoneDraftKeyValidationInput): boolean => {
  if (PHONE_DRAFT_CONTROL_KEYS.has(key)) {
    return true
  }

  if (PHONE_DRAFT_DIGIT_KEY_REGEX.test(key)) {
    return true
  }

  if (key !== '+') {
    return false
  }

  const normalizedCurrentValue = typeof currentValue === 'string' ? currentValue : ''
  const start = selectionStart ?? normalizedCurrentValue.length
  const end = selectionEnd ?? normalizedCurrentValue.length
  const nextValue = `${normalizedCurrentValue.slice(0, start)}+${normalizedCurrentValue.slice(end)}`

  return PHONE_DRAFT_REGEX.test(nextValue)
}

export const normalizePhoneInput = (value: unknown): string | null => {
  if (typeof value !== 'string') return null

  const trimmedValue = value.trim()
  if (!trimmedValue) return null

  if (!PHONE_ALLOWED_CHARS_REGEX.test(trimmedValue)) {
    return trimmedValue
  }

  const plusMatches = trimmedValue.match(/\+/g) ?? []
  if (plusMatches.length > 1 || (plusMatches.length === 1 && !trimmedValue.startsWith('+'))) {
    return trimmedValue
  }

  const digits = sanitizePhoneDigits(trimmedValue)
  if (!digits) {
    return trimmedValue
  }

  return trimmedValue.startsWith('+') ? `+${digits}` : digits
}

export const isE164Phone = (value: unknown): value is string => {
  return typeof value === 'string' && E164_REGEX.test(value)
}

export const buildE164Phone = (
  countryDialCode: unknown,
  nationalNumber: unknown,
): string | null => {
  const normalizedCountryDialCode = normalizePhoneInput(countryDialCode)
  const digits = sanitizePhoneDigits(nationalNumber)

  if (!normalizedCountryDialCode || !normalizedCountryDialCode.startsWith('+') || !digits) {
    return null
  }

  const phoneNumber = `${normalizedCountryDialCode}${digits}`
  return isE164Phone(phoneNumber) ? phoneNumber : null
}

export const normalizePhoneToE164 = (value: unknown): string | null => {
  const normalizedValue = normalizePhoneInput(value)
  if (!normalizedValue) return null

  return isE164Phone(normalizedValue) ? normalizedValue : null
}

export const getComparablePhoneKey = (value: unknown): string | null => {
  const normalizedValue = normalizePhoneInput(value)
  if (!normalizedValue) return null

  const digits = sanitizePhoneDigits(normalizedValue)
  return digits || null
}
