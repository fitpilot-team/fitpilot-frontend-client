import { Outlet } from '@tanstack/react-router'
import { Dumbbell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

export function AuthLayout() {
  const { t } = useTranslation()
  
  // Header link logic removed as per user request to move it to the bottom of the forms.
  // const getHeaderLink = ... (removed)

  return (
    <div className="h-svh w-svw flex overflow-hidden">
      {/* Left Column - Hero/Branding */}
      <div className="hidden lg:flex w-3/5 bg-gray-900 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2940&auto=format&fit=crop')`,
            filter: 'brightness(0.7)'
          }}
        ></div>
        
        {/* Content Overlay */}
        <div className="relative z-10 w-full p-16 flex flex-col justify-center h-full">
          <div className="max-w-xl space-y-6">
            <h1 className="text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
              {t('auth.hero.title_line1')}<br />
              {t('auth.hero.title_line2')}<br />
              {t('auth.hero.title_line3')}
            </h1>
            <p className="text-xl text-gray-200 font-light max-w-lg">
              {t('auth.hero.description')}
            </p>
            
            {/* Carousel indicators simulation */}
            <div className="flex gap-2 pt-8">
              <div className="h-1.5 w-12 bg-emerald-500 rounded-full"></div>
              <div className="h-1.5 w-4 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-2/5 flex flex-col bg-white relative overflow-y-auto">
        {/* Shared Header */}
        <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-900">
                <div className="bg-emerald-100 p-2 rounded-lg">
                    <Dumbbell className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-xl font-bold tracking-tight">FitPilot</span>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
            </div>
        </div>

        {/* Page Content */}
        <Outlet />

        {/* Shared Footer */}
        <div className="p-8">
            <div className="flex justify-center gap-6 text-xs text-gray-400 font-medium">
                <a href="#" className="hover:text-gray-600">{t('auth.footer.terms')}</a>
                <a href="#" className="hover:text-gray-600">{t('auth.footer.privacy')}</a>
                <a href="#" className="hover:text-gray-600">{t('auth.footer.support')}</a>
            </div>
            <div className="text-center mt-2 text-[10px] text-gray-300">
                {new Date().getFullYear()} © {t('auth.footer.copyright')}
            </div>
        </div>
      </div>
    </div>
  )
}
