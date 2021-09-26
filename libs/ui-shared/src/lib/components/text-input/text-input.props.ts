import type React from "react";
import type { I18nData } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TextInputProps<T = any>
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "defaultValue" | "value"
  > {
  /** The key for i18n translation (preceeds `placeholder`). */
  placeholderTx?: string;

  /**
   * Additional data, passed to the translation function when `placeholderTx`
   * is being used.
   */
  placeholderData?: I18nData;

  /** The raw placeholder text (is preceeded by `placeholderTx`). */
  placeholder?: string;

  defaultValue?: T;
  value?: T;
  valueTx?: T;

  /**
   * If set to `false`, the text input's contents cannot be changed.
   * Defaults to `true`.
   */
  isEditable?: boolean;

  /** A callback that is called when the value is changed. */
  onChangeText?: (value: string) => void;

  /** A callback that is called when the changed value is confirmed. */
  onConfirm?: (value: T) => void;

  /** A callback that is called when the changed value is discarded. */
  onCancel?: (value: string) => void;
}
