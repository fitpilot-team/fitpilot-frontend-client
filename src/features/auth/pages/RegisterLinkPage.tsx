import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { Lock, User, Loader2, AlertCircle, CheckCircle2, Phone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCompleteRegistrationMutation, useVerifyTokenQuery, useCheckUsernameAvailabilityMutation } from '../services/auth.queries'
import { useTranslation } from 'react-i18next'

export default function RegisterLinkPage() {
  const { t } = useTranslation()
  const search = useSearch({ strict: false }) as { token?: string }
  const navigate = useNavigate()
  
  // Queries & Mutations
  const { 
    data: verifyData,
    isLoading: isValidating, 
    isError: isTokenInvalid, 
    error: tokenError 
  } = useVerifyTokenQuery(search.token)

  const {
    mutate: completeRegistration,
    isPending: isSubmitting,
    isError: isSubmitError,
    error: submitError
  } = useCompleteRegistrationMutation(search.token ?? '')

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  })
  
  // Pre-fill form data when token is verified
  useEffect(() => {
    if (verifyData?.user) {
      setFormData(prev => ({
        ...prev,
        firstName: verifyData.user.name || '',
        lastName: verifyData.user.lastname || '',
        phoneNumber: verifyData.user.phone_number || ''
      }))
    }
  }, [verifyData])

  // Username checks
  const { mutate: checkUsername, isPending: isCheckingUsername } = useCheckUsernameAvailabilityMutation()
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
        onError: () => setIsUsernameAvailable(false)
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.username, checkUsername])

  // Local UI state for form validation
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setFormError(t('auth.registerLink.passwordsDoNotMatch'))
      return
    }
    setFormError(null)
    
    completeRegistration({
      token: search.token!,
      first_name: formData.firstName,
      lastname: formData.lastName,
      username: formData.username,
      password: formData.password
    }, {
      onSuccess: () => {
         // Redirect after 3 seconds
         setTimeout(() => navigate({ to: '/auth/sign-in' }), 3000)
      }
    })
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
    let errorTitle = t('auth.registerLink.errorTitle')

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

  // Valid Token - Show Registration Form
  return (
    <div className="flex-1 flex items-center justify-center p-8">


      <div className="w-full max-w-[420px] space-y-10">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 block">{t('auth.registerLink.firstName')}</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                   </div>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    placeholder="John"
                    disabled={isSubmitting}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 block">{t('auth.registerLink.lastName')}</label>
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                   </div>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Doe"
                    disabled={isSubmitting}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
            </div>
          </div>

          {/* Phone Number (Read-Only) */}
          <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">{t('auth.registerLink.phoneNumber')}</label>
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

          {/* Username */}


          {/* Username */}
          <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">{t('auth.registerLink.username')}</label>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                 </div>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
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
                <p className="text-sm text-red-500 ml-1">
                  {t('auth.registerLink.usernameTaken') || "Username is already taken"}
                </p>
              )}
              {formData.username.length >= 3 && isUsernameAvailable === true && (
                <p className="text-sm text-emerald-500 ml-1">
                  {t('auth.registerLink.usernameAvailable') || "Username is available"}
                </p>
              )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 block">{t('auth.registerLink.password')}</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="Create a password"
                disabled={isSubmitting}
                className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 block">{t('auth.registerLink.confirmPassword')}</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Confirm password"
                disabled={isSubmitting}
                className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {formError && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100">
                  {formError}
              </div>
          )}
          
          {isSubmitError && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100">
                  {(submitError as any)?.response?.data?.message || t('auth.registerLink.errorOccurred')}
              </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> {t('auth.registerLink.creatingAccount')}
              </span>
            ) : t('auth.registerLink.submit')}
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