import React from "react";

export interface TextInputProps extends React.HTMLAttributes<HTMLInputElement> {
  /**
   * Additional data, passed to the translation function when `placeholderTx`
   * is being used.
   */
  placeholderData?: {
    context?: string;
    count?: number;
    date?: Date;
    [key: string]: unknown;
  };

  /** The raw placeholder text (is preceeded by `placeholderTx`). */
  placeholder?: string;

  /** The key for i18n translation (preceeds `placeholder`). */
  placeholderTx?: string;

  /** Callback for value changes. */
  onEdit?: (value: string) => void;
}
