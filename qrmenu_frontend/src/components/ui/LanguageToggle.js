import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../config/i18n';

const LanguageToggle = ({ className = '' }) => {
  const { i18n: i18nInstance } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || i18nInstance.language || 'fr';
  });

  // Initialize language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      if (i18nInstance.language !== savedLanguage) {
        i18n.changeLanguage(savedLanguage).then(() => {
          setCurrentLanguage(savedLanguage);
        });
      } else {
        setCurrentLanguage(savedLanguage);
      }
    } else {
      const defaultLang = i18nInstance.language || 'fr';
      setCurrentLanguage(defaultLang);
      if (!localStorage.getItem('language')) {
        localStorage.setItem('language', defaultLang);
      }
    }
  }, [i18nInstance.language]);

  // Update current language when i18n language changes
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLanguage(lng);
      localStorage.setItem('language', lng);
    };
    
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLanguage)
      .then(() => {
        setCurrentLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
      })
      .catch((error) => {
        console.error('Error changing language:', error);
      });
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`
        inline-flex
        items-center
        justify-center
        px-3 py-1.5
        text-sm font-semibold
        text-zinc-700
        hover:text-[#FF5A1F]
        transition-all duration-200
        hover:bg-zinc-100
        rounded-lg
        focus:outline-none
        focus:ring-2
        focus:ring-[#FF5A1F]
        focus:ring-offset-2
        min-w-[60px]
        ${className}
      `}
      aria-label={currentLanguage === 'fr' ? 'Switch to English' : 'Passer en français'}
      title={currentLanguage === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      <span className="uppercase">
        {currentLanguage === 'fr' ? 'FR' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageToggle;

