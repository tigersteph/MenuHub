import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '../locales/en/translation.json';
import translationFR from '../locales/fr/translation.json';

// Get saved language from localStorage or use default
const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
    return savedLanguage;
  }
  return 'fr'; // langue par défaut
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      fr: { translation: translationFR }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false
    }
  });

export default i18n;
