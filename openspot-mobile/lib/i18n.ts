import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import ja from '../locales/ja.json';

const resources = {
  en: { translation: en },
  ja: { translation: ja },
};

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ja', // デフォルト表示を日本語にする場合。英語指定にしたい場合は 'en' に変更してください
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
