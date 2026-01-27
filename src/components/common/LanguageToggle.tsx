import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { useState } from 'react';

export const LanguageToggle = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'es', label: 'Español' },
        { code: 'en', label: 'English' }
    ];

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/50 hover:bg-white border border-transparent hover:border-gray-200 transition-all text-sm font-medium text-gray-600 hover:text-gray-900 shadow-sm hover:shadow"
            >
                <Globe size={16} className="text-gray-500" />
                <span>{currentLanguage.label}</span>
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors
                                    ${i18n.language === lang.code ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-gray-700'}
                                `}
                            >
                                {lang.label}
                                {i18n.language === lang.code && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
