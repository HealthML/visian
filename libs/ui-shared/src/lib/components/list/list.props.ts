import type React from "react";

import type { IconType } from "../icon";

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  labelTx?: string;
  label?: string;

  /** An optional value to pass to the item's listeners. */
  value?: string;

  /**
   * If set to `true`, the list item is displayed in a highlighted active
   * state.
   */
  isActive?: boolean;

  /**
   * If set to `true`, signals that this is the last item and the following
   * divider should thus be omitted.
   */
  isLast?: boolean;

  isLabelEditable?: boolean;
  onChangeLabelText?: (string: string) => void;
  onConfirmLabelText?: (value: string) => void;

  /**
   * The key of the list item's icon (if any).
   * Alternatively, an object with a color can be passed to render a palette
   * element.
   */
  icon?: IconType | { color: string; icon?: IconType };
  iconRef?: React.ForwardedRef<HTMLDivElement | SVGSVGElement>;

  /** If set to `true`, displays the item's icon in an disabled state. */
  disableIcon?: boolean;

  /** An optional listener that is called when the icon is pressed. */
  onIconPress?: (value: string | undefined, event: React.PointerEvent) => void;

  /** The key of the list item's trailing icon (if any). */
  trailingIcon?: IconType;
  trailingIconRef?: React.ForwardedRef<SVGSVGElement>;

  innerHeight?: string;

  /** If set to `true`, displays the item's icon in an disabled state. */
  disableTrailingIcon?: boolean;

  /** An optional listener that is called when the icon is pressed. */
  onTrailingIconPress?: (
    value: string | undefined,
    event: React.PointerEvent,
  ) => void;
}
