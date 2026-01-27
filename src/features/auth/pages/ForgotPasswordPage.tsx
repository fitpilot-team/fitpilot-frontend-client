import { useState } from 'react'
import { Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-[420px] space-y-10">
        
        {/* Title */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('auth.forgotPassword.title')}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('auth.forgotPassword.subtitle')}
          </p>
        </div>

        {!submitted ? (
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 block">{t('auth.forgotPassword.email')}</label>
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
                    placeholder="user@example.com"
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {t('auth.forgotPassword.submit')}
            </button>
            <div className="text-center text-sm font-medium">
              <span className="text-gray-500">{t('auth.header.rememberPassword')} </span>
              <Link to="/auth/sign-in" className="text-emerald-600 hover:text-emerald-700">
                {t('auth.header.signIn')}
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 text-center bg-emerald-50 p-6 rounded-2xl text-emerald-700">
            <p className="font-medium">{t('auth.forgotPassword.checkEmail')}</p>
          </div>
        )}

      </div>
    </div>
  )
}
