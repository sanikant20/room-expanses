import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import ne from "./ne.json";

const savedLang = localStorage.getItem('language') || 'en';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ne: { translation: ne },
        },
        lng: savedLang, // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false, // React already does escaping
        },
    });

export default i18n;
