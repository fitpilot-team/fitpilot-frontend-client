import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('es') ? 'en' : 'es'
    i18n.changeLanguage(newLang)
  }
  
  const currentLang = i18n.language.startsWith('es') ? 'ES' : 'EN'

  return (
    <button 
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
    >
      <Globe className="w-4 h-4" />
      <span>{currentLang}</span>
    </button>
  )
}
