import i18n, { FormatFunction } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import moment from "moment";
import { initReactI18next } from "react-i18next";

export const supportedLanguages = ["en", "de"];

const format = (value: unknown, format: string) => {
  if (format === "uppercase") return (value as string).toUpperCase();
  if (value instanceof Date) return moment(value).format(format);
  return value;
};

export const initI18n = (testResources?: {
  [language: string]: { translation: { [key: string]: string } };
}) =>
  testResources
    ? i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
          resources: testResources,
          fallbackLng: "en",

          interpolation: {
            // React is XSS-safe already
            escapeValue: false,
            format: format as FormatFunction,
          },
        })
    : i18n
        .use(Backend)
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
          backend: { loadPath: "/assets/{{lng}}.json" },
          fallbackLng: "en",
          load: "languageOnly",

          interpolation: {
            // React is XSS-safe already
            escapeValue: false,
            format: format as FormatFunction,
          },
        });

export { i18n };
export { I18nextProvider as I18nProvider, useTranslation } from "react-i18next";
