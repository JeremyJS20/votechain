import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../Data/Translations/en.json';
import esTranslation from '../Data/Translations/es.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      es: { translation: esTranslation },
    },
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
