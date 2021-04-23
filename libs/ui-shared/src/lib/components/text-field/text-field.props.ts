import type React from "react";

import type { I18nData } from "../types";

export interface TextFieldProps extends React.HTMLAttributes<HTMLInputElement> {
  /**
   * Additional data, passed to the translation function when `placeholderTx`
   * is being used.
   */
  placeholderData?: I18nData;

  /** The raw placeholder text (is preceeded by `placeholderTx`). */
  placeholder?: string;

  /** The key for i18n translation (preceeds `placeholder`). */
  placeholderTx?: string;

  /** Callback for value changes. */
  onEdit?: (value: string) => void;
}
