import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoginMutation } from '../services/auth.queries'
import { useAuth } from '../context/AuthContext'
import { jwtDecode } from 'jwt-decode'
import { TurnstileChallenge } from '../components/TurnstileChallenge'

export function LoginPage() {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [turnstileRenderKey, setTurnstileRenderKey] = useState(0)
  const navigate = useNavigate()
  const search: any = useSearch({ strict: false }) // Get search params safely
  const loginMutation = useLoginMutation()
  const { login } = useAuth()
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? ''
  const turnstileEnabled = Boolean(turnstileSiteKey)

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const identifier = formData.get('identifier') as string
      const password = formData.get('password') as string

      if (turnstileEnabled && !captchaToken) {
          return
      }
      
      loginMutation.mutate({ identifier, password, app_type: 'CLIENT_APP', ...(captchaToken ? { captcha_token: captchaToken } : {}) }, {
          onSuccess: (data: any) => {
              const token = data.access_token || data.token
              
              try {
                  const decoded: any = jwtDecode(token)
                  // Construct a user object from the token payload
                  // The backend returns 'sub' as the ID.
                  const userFromToken = {
                      id: decoded.sub,
                      name: decoded.name || 'User', // Fallback, will be updated by Dashboard fetch if possible or we can fetch profile later
                      email: decoded.email,
                      role: decoded.role,
                      // Add other fields as defaults since they are required by the User interface
                      lastname: '',
                      is_active: true,
                      phone_number: '',
                      is_phone_verified: false,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      profile_picture: null,
                      deleted_at: null,
                      username: decoded.email, // Use email as username fallback
                      onboarding_status: decoded.onboarding_status || 'pending',
                  }
                  
                  login(token, userFromToken)
                  
                  // Redirect to the intended page or dashboard
                  if (search.redirect) {
                      navigate({ to: search.redirect })
                  } else {
                      navigate({ to: '/dashboard' })
                  }

              } catch (error) {
                  console.error('Failed to decode token:', error)
                  // Handle error, maybe show a toast
              }
          },
          onError: () => {
              setCaptchaToken(null)
              setTurnstileRenderKey((currentValue) => currentValue + 1)
          }
      })
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-[420px] space-y-10">
        
        {/* Title */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('auth.login.title')}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('auth.login.subtitle')}
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleLogin}>
          <div className="space-y-6">
            
            {/* Identifier */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">{t('auth.login.identifier') || 'Email, Username or Phone'}</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="identifier"
                  required
                  placeholder={t('auth.login.identifierPlaceholder') || 'user@example.com'}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-900 block">{t('auth.login.password')}</label>
                <Link to="/auth/forgot-password" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                    {t('auth.login.forgotPassword')}
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3">
                <div className="flex items-center h-5">
                     <input
                        id="remember"
                        type="checkbox"
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                    />
                </div>
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                    {t('auth.login.keepLoggedIn')}
                </label>
            </div>

            {turnstileEnabled && (
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm font-medium text-slate-700">
                  {t('auth.login.turnstile.label')}
                </p>
                <TurnstileChallenge
                  key={turnstileRenderKey}
                  loadErrorMessage={t('auth.login.turnstile.loadError')}
                  onTokenChange={setCaptchaToken}
                  siteKey={turnstileSiteKey}
                />
                {!captchaToken && (
                  <p className="text-xs text-slate-500">
                    {t('auth.login.turnstile.required')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending || (turnstileEnabled && !captchaToken)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? 'Signing in...' : t('auth.login.submit')}
          </button>
          
          <div className="text-center text-sm font-medium">
            <span className="text-gray-500">{t('auth.header.dontHaveAccount')} </span>
            <Link to="/auth/sign-up" className="text-emerald-600 hover:text-emerald-700">
              {t('auth.header.register')}
            </Link>
          </div>
          
          {loginMutation.isError && (
              <div className="text-red-500 text-sm text-center">
                  {(loginMutation.error as any)?.response?.data?.message || 'Login failed'}
              </div>
          )}

        </form>
        
      </div>
    </div>
  )
}

