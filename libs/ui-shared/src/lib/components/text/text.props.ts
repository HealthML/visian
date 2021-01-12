import React from "react";

export interface TextProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * If provided, switches out the rendered HTML tag.
   *
   * @see https://styled-components.com/docs/api#as-polymorphic-prop
   */
  as?: string;

  /**
   * Additional data, passed to the translation function when `tx`
   * is being used.
   */
  data?: {
    context?: string;
    count?: number;
    date?: Date;
    [key: string]: unknown;
  };

  /** The raw text (is preceeded by `tx`, preceedes `children`). */
  text?: string;

  /** The key for i18n translation (preceeds `text` & `children`). */
  tx?: string;
}
