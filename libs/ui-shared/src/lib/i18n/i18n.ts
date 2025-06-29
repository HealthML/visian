import i18n, { FormatFunction } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import moment from "moment";
import { initReactI18next } from "react-i18next";

const format = (value: unknown, formatMode: string) => {
  if (formatMode === "uppercase") return (value as string).toUpperCase();
  if (value instanceof Date) return moment(value).format(formatMode);
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
          backend: {
            loadPath: `${process.env.NX_DEPLOY_URL || "/"}assets/{{lng}}.json`,
          },
          fallbackLng: "en",
          load: "languageOnly",
          nsSeparator: false,

          interpolation: {
            // React is XSS-safe already
            escapeValue: false,
            format: format as FormatFunction,
          },
        });

export { i18n };
export { I18nextProvider as I18nProvider, useTranslation } from "react-i18next";
