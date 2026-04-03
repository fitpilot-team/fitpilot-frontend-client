import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Lock, User, Loader2, AlertCircle, CheckCircle2, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { jwtDecode } from 'jwt-decode'
import { getApiErrorDetails } from '@/utils/apiError'
import { TurnstileChallenge } from '../components/TurnstileChallenge'
import { useAuth } from '../context/AuthContext'
import {
  useCheckUsernameAvailabilityMutation,
  useCompleteRegistrationMutation,
  useVerifyTokenQuery,
} from '../services/auth.queries'
import { authService } from '../services/auth.service'

export default function RegisterLinkPage() {
  const { t } = useTranslation()
  const search = useSearch({ strict: false }) as { redirect?: string; token?: string }
  const navigate = useNavigate()
  const { login } = useAuth()
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? ''
  const turnstileEnabled = Boolean(turnstileSiteKey)

  const { data: verifyData, isLoading: isValidating, isError: isTokenInvalid, error: tokenError } =
    useVerifyTokenQuery(search.token)

  const { mutate: completeRegistration, isPending: isSubmitting } =
    useCompleteRegistrationMutation(search.token ?? '')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [turnstileRenderKey, setTurnstileRenderKey] = useState(0)

  useEffect(() => {
    if (verifyData?.user) {
      setFormData((prev) => ({
        ...prev,
        firstName: verifyData.user.name || '',
        lastName: verifyData.user.lastname || '',
        phoneNumber: verifyData.user.phone_number || '',
      }))
    }
  }, [verifyData])

  const { mutate: checkUsername, isPending: isCheckingUsername } =
    useCheckUsernameAvailabilityMutation()
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    const username = formData.username
    if (!username || username.length < 3) {
      setIsUsernameAvailable(null)
      return
    }

    const timer = setTimeout(() => {
      checkUsername(username, {
        onSuccess: (data) => setIsUsernameAvailable(data.available),
        onError: () => setIsUsernameAvailable(false),
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.username, checkUsername])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setFormError(t('auth.registerLink.passwordsDoNotMatch'))
      return
    }

    if (turnstileEnabled && !captchaToken) {
      setFormError(t('auth.registerLink.turnstile.required'))
      return
    }

    if (formData.username.length >= 3 && isUsernameAvailable === false) {
      setFormError(t('auth.registerLink.usernameTaken'))
      return
    }

    setFormError(null)

    completeRegistration(
      {
        token: search.token!,
        first_name: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
        username: formData.username.trim(),
        password: formData.password,
        ...(captchaToken ? { captcha_token: captchaToken } : {}),
      },
      {
        onSuccess: async (data) => {
          const authToken = data.access_token || data.token

          if (!authToken) {
            setFormError(t('auth.registerLink.submitFailed'))
            return
          }

          try {
            const decoded: any = jwtDecode(authToken)
            const onboardingStatus = decoded.onboarding_status || 'pending'
            const userFromToken = {
              id: decoded.sub,
              name: decoded.name || formData.firstName.trim() || 'User',
              email: decoded.email || '',
              role: decoded.role || 'CLIENT',
              lastname: decoded.lastname || formData.lastName.trim(),
              is_active: true,
              phone_number: formData.phoneNumber,
              is_phone_verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              profile_picture: null,
              deleted_at: null,
              username: decoded.username || formData.username.trim() || decoded.email || null,
              onboarding_status: onboardingStatus,
            }

            login(authToken, userFromToken)

            try {
              const freshUser = await authService.getMe()
              login(authToken, freshUser)
            } catch (error) {
              console.error('Failed to load user after complete registration:', error)
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
            console.error('Failed to decode token after complete registration:', error)
            setFormError(t('auth.registerLink.submitFailed'))
          }
        },
        onError: (error: unknown) => {
          setCaptchaToken(null)
          setTurnstileRenderKey((currentValue) => currentValue + 1)

          const errorDetails = getApiErrorDetails(error)
          if (errorDetails.code === 'captcha_required') {
            setFormError(t('auth.registerLink.turnstile.required'))
            return
          }

          setFormError(errorDetails.message || t('auth.registerLink.submitFailed'))
        },
      },
    )
  }

  if (isValidating) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (isTokenInvalid) {
    const status = (tokenError as any)?.response?.status
    const backendMessage = (tokenError as any)?.response?.data?.message

    let errorMessage = t('auth.registerLink.invalidToken')
    const errorTitle = t('auth.registerLink.errorTitle')

    if (status === 404) {
      errorMessage = t('auth.registerLink.tokenNotFound')
    } else if (status === 400 || status === 409) {
      if (typeof backendMessage === 'string') {
        errorMessage = backendMessage
      }
    } else if (backendMessage) {
      errorMessage = backendMessage
    }

    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[420px] space-y-8 text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">{errorTitle}</h2>
            <p className="text-gray-500 text-lg leading-relaxed">{errorMessage}</p>
          </div>

          <div className="pt-4">
            <Link
              to="/auth/sign-in"
              className="inline-flex w-full items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5"
            >
              {t('auth.registerLink.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-[420px] space-y-10">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">
                {t('auth.registerLink.firstName')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                  disabled={isSubmitting}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">
                {t('auth.registerLink.lastName')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                  disabled={isSubmitting}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 block">
              {t('auth.registerLink.phoneNumber')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.phoneNumber}
                disabled
                className="block w-full pl-11 pr-4 py-3.5 bg-gray-100 border-0 rounded-2xl text-gray-500 ring-1 ring-inset ring-gray-200 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 block">
              {t('auth.registerLink.username')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="johndoe123"
                disabled={isSubmitting}
                className={`block w-full pl-11 pr-10 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:bg-white transition-all disabled:opacity-50 ${
                  formData.username.length > 0 && isUsernameAvailable === false
                    ? 'ring-red-300 focus:ring-red-500 text-red-900'
                    : formData.username.length > 0 && isUsernameAvailable === true
                      ? 'ring-emerald-300 focus:ring-emerald-500 text-emerald-900'
                      : 'ring-gray-200 focus:ring-emerald-500'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                {isCheckingUsername ? (
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                ) : formData.username.length >= 3 && isUsernameAvailable === true ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : formData.username.length >= 3 && isUsernameAvailable === false ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : null}
              </div>
            </div>
            {formData.username.length >= 3 && isUsernameAvailable === false && (
              <p className="text-sm text-red-500 ml-1">{t('auth.registerLink.usernameTaken')}</p>
            )}
            {formData.username.length >= 3 && isUsernameAvailable === true && (
              <p className="text-sm text-emerald-500 ml-1">
                {t('auth.registerLink.usernameAvailable')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 block">
              {t('auth.registerLink.password')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a password"
                disabled={isSubmitting}
                className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 block">
              {t('auth.registerLink.confirmPassword')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                disabled={isSubmitting}
                className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {turnstileEnabled && (
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-700">
                {t('auth.registerLink.turnstile.label')}
              </p>
              <TurnstileChallenge
                key={turnstileRenderKey}
                loadErrorMessage={t('auth.registerLink.turnstile.loadError')}
                onTokenChange={setCaptchaToken}
                siteKey={turnstileSiteKey}
              />
              {!captchaToken && (
                <p className="text-xs text-slate-500">{t('auth.registerLink.turnstile.required')}</p>
              )}
            </div>
          )}

          {formError && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || (turnstileEnabled && !captchaToken)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> {t('auth.registerLink.creatingAccount')}
              </span>
            ) : (
              t('auth.registerLink.submit')
            )}
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
