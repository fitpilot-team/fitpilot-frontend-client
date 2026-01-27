import { Mail, Lock, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

export function RegisterPage() {
  const { t } = useTranslation()
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-[420px] space-y-10">
        
        {/* Title */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('auth.register.title')}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('auth.register.subtitle')}
          </p>
        </div>

        <form className="space-y-8" action="#" method="POST" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-6">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 block">{t('auth.register.firstName')}</label>
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
                    placeholder="John"
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 block">{t('auth.register.lastName')}</label>
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
                    placeholder="Doe"
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">{t('auth.register.email')}</label>
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

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">{t('auth.register.password')}</label>
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
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-4 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {t('auth.register.submit')}
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
