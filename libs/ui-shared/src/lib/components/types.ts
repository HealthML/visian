import { I18nData } from "../types";

export interface I18nProps {
  /**
   * Additional data, passed to the translation function when `tx`
   * is being used.
   */
  data?: I18nData;

  /** The raw text (is preceeded by `tx`, preceedes `children`). */
  text?: string;

  /** The key for i18n translation (preceeds `text` & `children`). */
  tx?: string;
}

export interface AsProps {
  /**
   * If provided, switches out the rendered HTML tag.
   *
   * @see https://styled-components.com/docs/api#as-polymorphic-prop
   */
  as?: string | React.ComponentType<unknown>;
}
