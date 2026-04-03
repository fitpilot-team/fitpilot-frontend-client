import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle2, LoaderCircle, Lock, Mail, Phone, User } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { jwtDecode } from 'jwt-decode'
import { CountryCodeSelect } from '@/components/common/CountryCodeSelect'
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  getPhoneCountryOption,
  resolvePhoneCountryFromInternationalNumber,
} from '@/constants/phoneCountries'
import {
  buildE164Phone,
  isAllowedPhoneDraftKey,
  normalizePhoneInput,
  normalizePhoneToE164,
  PHONE_DRAFT_HTML_PATTERN,
  sanitizePhoneDraftInput,
} from '@/utils/phone'
import { TurnstileChallenge } from '../components/TurnstileChallenge'
import { useAuth } from '../context/AuthContext'
import { useCheckPhoneAvailabilityMutation, useSignupMutation } from '../services/auth.queries'
import { authService } from '../services/auth.service'
import { resolveRegisterSubmitErrorMessage } from './registerError'
import {
  REGISTER_PHONE_AVAILABILITY_DEBOUNCE_MS,
  resolveRegisterPhoneAvailabilityFeedback,
  shouldApplyRegisterPhoneAvailabilityResult,
  shouldCheckRegisterPhoneAvailability,
  type RegisterPhoneAvailabilityStatus,
} from './registerPhoneAvailability'

export function RegisterPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const search: any = useSearch({ strict: false })
  const { login } = useAuth()
  const signupMutation = useSignupMutation()
  const checkPhoneAvailabilityMutation = useCheckPhoneAvailabilityMutation()
  const checkPhoneAvailability = checkPhoneAvailabilityMutation.mutateAsync
  const phoneAvailabilityRequestIdRef = useRef(0)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedCountryCode, setSelectedCountryCode] = useState(DEFAULT_PHONE_COUNTRY_CODE)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [turnstileRenderKey, setTurnstileRenderKey] = useState(0)
  const [phoneAvailabilityStatus, setPhoneAvailabilityStatus] =
    useState<RegisterPhoneAvailabilityStatus>('idle')

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? ''
  const turnstileEnabled = Boolean(turnstileSiteKey)

  const resolvePhoneForSubmission = (
    rawPhoneNumber = phoneNumber,
    countryCode = selectedCountryCode,
  ) => {
    const normalizedInput = normalizePhoneInput(rawPhoneNumber)
    if (!normalizedInput) {
      return null
    }

    if (normalizedInput.startsWith('+')) {
      return normalizePhoneToE164(normalizedInput)
    }

    const country = getPhoneCountryOption(countryCode, i18n.language)
    return buildE164Phone(country.dialCode, normalizedInput)
  }

  const handlePhoneNumberChange = (rawValue: string) => {
    const nextDraftPhone = sanitizePhoneDraftInput(rawValue)
    let nextCountryCode = selectedCountryCode
    let nextPhoneNumber = nextDraftPhone

    if (nextDraftPhone.startsWith('+')) {
      const countryMatch = resolvePhoneCountryFromInternationalNumber(nextDraftPhone, i18n.language)

      if (countryMatch.status === 'unique' && countryMatch.matchedCountry) {
        nextCountryCode = countryMatch.matchedCountry.code
        nextPhoneNumber = countryMatch.nationalNumber
      }
    }

    if (nextCountryCode !== selectedCountryCode) {
      setSelectedCountryCode(nextCountryCode)
    }

    setPhoneNumber(nextPhoneNumber)
    setPhoneAvailabilityStatus(nextPhoneNumber.trim() === '' ? 'idle' : 'invalid')
    if (formError) {
      setFormError(null)
    }
  }

  const handlePhoneNumberKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return
    }

    if (
      isAllowedPhoneDraftKey({
        key: event.key,
        currentValue: event.currentTarget.value,
        selectionStart: event.currentTarget.selectionStart,
        selectionEnd: event.currentTarget.selectionEnd,
      })
    ) {
      return
    }

    event.preventDefault()
  }

  const currentResolvedPhone = resolvePhoneForSubmission()
  const phoneAvailabilityFeedback = resolveRegisterPhoneAvailabilityFeedback(
    phoneAvailabilityStatus,
    {
      available: t('auth.register.phoneAvailability.available'),
      checking: t('auth.register.phoneAvailability.checking'),
      error: t('auth.register.phoneAvailability.error'),
      unavailable: t('auth.register.phoneAvailability.unavailable'),
    },
  )

  const phoneFieldError =
    phoneAvailabilityStatus === 'invalid' && phoneNumber.trim() !== ''
      ? t('auth.register.phoneInvalid')
      : phoneAvailabilityFeedback.error

  const phoneFieldHelperText = phoneFieldError
    ? undefined
    : phoneAvailabilityFeedback.helperText || t('auth.register.phoneHint')

  const isFormValid =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    email.trim() !== '' &&
    Boolean(currentResolvedPhone) &&
    phoneAvailabilityStatus === 'available' &&
    password.length >= 6 &&
    confirmPassword !== '' &&
    password === confirmPassword &&
    (!turnstileEnabled || Boolean(captchaToken))

  useEffect(() => {
    const requestId = phoneAvailabilityRequestIdRef.current + 1
    phoneAvailabilityRequestIdRef.current = requestId

    if (
      !shouldCheckRegisterPhoneAvailability({
        phoneDraft: phoneNumber,
        resolvedPhone: currentResolvedPhone,
      })
    ) {
      setPhoneAvailabilityStatus(phoneNumber.trim() === '' ? 'idle' : 'invalid')
      return
    }

    const requestedPhone = currentResolvedPhone
    if (!requestedPhone) {
      setPhoneAvailabilityStatus('invalid')
      return
    }

    setPhoneAvailabilityStatus('checking')

    const debounceTimer = window.setTimeout(() => {
      void checkPhoneAvailability({ phone_number: requestedPhone })
        .then((response) => {
          if (
            !shouldApplyRegisterPhoneAvailabilityResult({
              currentPhone: currentResolvedPhone,
              latestRequestId: phoneAvailabilityRequestIdRef.current,
              requestId,
              requestedPhone,
            })
          ) {
            return
          }

          setPhoneAvailabilityStatus(response.isAvailable ? 'available' : 'unavailable')
        })
        .catch(() => {
          if (
            !shouldApplyRegisterPhoneAvailabilityResult({
              currentPhone: currentResolvedPhone,
              latestRequestId: phoneAvailabilityRequestIdRef.current,
              requestId,
              requestedPhone,
            })
          ) {
            return
          }

          setPhoneAvailabilityStatus('error')
        })
    }, REGISTER_PHONE_AVAILABILITY_DEBOUNCE_MS)

    return () => window.clearTimeout(debounceTimer)
  }, [checkPhoneAvailability, currentResolvedPhone, phoneNumber])

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    const normalizedPhoneNumber = resolvePhoneForSubmission()

    if (password !== confirmPassword) {
      setFormError(t('auth.register.passwordsDoNotMatch'))
      return
    }

    if (password.length < 6) {
      setFormError(t('auth.register.passwordMin'))
      return
    }

    if (!normalizedPhoneNumber) {
      setFormError(t('auth.register.phoneInvalid'))
      return
    }

    if (phoneAvailabilityStatus !== 'available') {
      setFormError(phoneFieldError || t('auth.register.phoneInvalid'))
      return
    }

    if (turnstileEnabled && !captchaToken) {
      setFormError(t('auth.register.turnstile.required'))
      return
    }

    signupMutation.mutate(
      {
        name: firstName.trim(),
        lastname: lastName.trim(),
        email: email.trim(),
        password,
        role: 'CLIENT',
        phone_number: normalizedPhoneNumber,
        ...(captchaToken ? { captcha_token: captchaToken } : {}),
      },
      {
        onSuccess: async (data) => {
          const token = data.access_token || data.token

          if (!token) {
            setFormError(t('auth.register.submitFailed'))
            return
          }

          try {
            const decoded: any = jwtDecode(token)
            const onboardingStatus = decoded.onboarding_status || 'pending'
            const userFromToken = {
              id: decoded.sub,
              name: decoded.name || firstName.trim() || 'User',
              email: decoded.email || email.trim(),
              role: decoded.role || 'CLIENT',
              lastname: decoded.lastname || lastName.trim(),
              is_active: true,
              phone_number: normalizedPhoneNumber,
              is_phone_verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              profile_picture: null,
              deleted_at: null,
              username: decoded.email || email.trim(),
              onboarding_status: onboardingStatus,
            }

            login(token, userFromToken)

            try {
              const freshUser = await authService.getMe()
              login(token, freshUser)
            } catch (error) {
              console.error('Failed to load user after signup:', error)
            }

            if (search.redirect) {
              navigate({ to: search.redirect })
              return
            }

            if (onboardingStatus !== 'completed') {
              navigate({ to: '/onboarding' })
              return
            }

            navigate({ to: '/dashboard' })
          } catch (error) {
            console.error('Failed to decode token:', error)
            setFormError(t('auth.register.submitFailed'))
          }
        },
        onError: (error: unknown) => {
          setCaptchaToken(null)
          setTurnstileRenderKey((currentValue) => currentValue + 1)
          setFormError(
            resolveRegisterSubmitErrorMessage(error, {
              fallback: t('auth.register.submitFailed'),
              phoneAlreadyInUse: t('auth.register.phoneAlreadyInUse'),
            }),
          )
        },
      },
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-[420px] space-y-10">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('auth.register.title')}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">{t('auth.register.subtitle')}</p>
        </div>

        <form className="space-y-8" onSubmit={handleRegister}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 block">
                  {t('auth.register.firstName')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 block">
                  {t('auth.register.lastName')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,6.75rem)_minmax(0,1fr)] sm:items-start">
              <CountryCodeSelect
                id="country-code"
                label={t('auth.register.countryCodeLabel')}
                locale={i18n.language}
                placeholder={t('auth.register.countryCodePlaceholder')}
                searchPlaceholder={t('auth.register.countryCodeSearchPlaceholder')}
                emptyMessage={t('auth.register.countryCodeNoResults')}
                value={selectedCountryCode}
                onChange={(country) => {
                  setSelectedCountryCode(country.code)
                  setPhoneAvailabilityStatus(phoneNumber.trim() === '' ? 'idle' : 'invalid')
                  if (formError) {
                    setFormError(null)
                  }
                }}
              />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 block">
                  {t('auth.register.phoneLabel')}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    id="phone-number"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    pattern={PHONE_DRAFT_HTML_PATTERN}
                    required
                    value={phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    onKeyDown={handlePhoneNumberKeyDown}
                    placeholder={t('auth.register.phonePlaceholder')}
                    className={`block w-full bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:bg-white transition-all pl-11 py-3.5 ${
                      phoneAvailabilityFeedback.indicator === 'checking' ||
                      phoneAvailabilityFeedback.indicator === 'success'
                        ? 'pr-11'
                        : 'pr-4'
                    } ${
                      phoneFieldError
                        ? 'ring-2 ring-inset ring-red-200 focus:ring-red-400'
                        : 'ring-1 ring-inset ring-gray-200 focus:ring-emerald-500'
                    }`}
                  />
                  {phoneAvailabilityFeedback.indicator === 'checking' && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <LoaderCircle className="h-4 w-4 animate-spin text-slate-400" />
                    </div>
                  )}
                  {phoneAvailabilityFeedback.indicator === 'success' && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                  )}
                </div>
                {phoneFieldError ? (
                  <p className="text-xs text-red-500">{phoneFieldError}</p>
                ) : (
                  <p
                    className={`text-xs ${
                      phoneAvailabilityFeedback.indicator === 'success'
                        ? 'text-emerald-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {phoneFieldHelperText}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">
                {t('auth.register.email')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">
                {t('auth.register.password')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">
                {t('auth.register.confirmPassword')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {turnstileEnabled && (
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm font-medium text-slate-700">
                  {t('auth.register.turnstile.label')}
                </p>
                <TurnstileChallenge
                  key={turnstileRenderKey}
                  loadErrorMessage={t('auth.register.turnstile.loadError')}
                  onTokenChange={setCaptchaToken}
                  siteKey={turnstileSiteKey}
                />
                {!captchaToken && (
                  <p className="text-xs text-slate-500">{t('auth.register.turnstile.required')}</p>
                )}
              </div>
            )}
          </div>

          {formError && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={signupMutation.isPending || !isFormValid}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signupMutation.isPending ? t('auth.register.creatingAccount') : t('auth.register.submit')}
          </button>

          <div className="text-center text-sm font-medium">
            <span className="text-gray-500">{t('auth.header.alreadyHaveAccount')} </span>
            <Link to="/auth/sign-in" className="text-emerald-600 hover:text-emerald-700">
              {t('auth.header.signIn')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
