/** Additional data, passed to the translation function. */
export interface I18nData {
  context?: string;
  count?: number;
  date?: Date;
  [key: string]: unknown;
}

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

export interface DelayHandlingButtonContainerProps {
  onPointerEnterButton?: () => void;
  onPointerLeaveButton?: () => void;
  /** If true, the tooltip is shown without any delay after PointerEnter. */
  shouldForceTooltip?: boolean;
}
