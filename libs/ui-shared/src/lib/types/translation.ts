/** Additional data, passed to the translation function. */
export interface I18nData {
  context?: string;
  count?: number;
  date?: Date;
  [key: string]: unknown;
}

export type SupportedLanguage = "en" | "de";
