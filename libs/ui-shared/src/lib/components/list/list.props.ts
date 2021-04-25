import React from "react";

import { IconType } from "../icon";

export type ListProps = React.HTMLAttributes<HTMLDivElement>;

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  labelTx?: string;
  label?: string;

  /** An optional value to pass to the item's listeners. */
  value?: string;

  /**
   * The key of the list item's icon (if any).
   * Alternatively, an object with a color can be passed to render a palette
   * element.
   */
  icon?: IconType | { color: string };

  /** If set to `true`, displays the item's icon in an disabled state. */
  disableIcon?: boolean;

  /** An optional listener that is called when the icon is pressed. */
  onIconPress?: (value?: string) => void;

  /** The key of the list item's trailing icon (if any). */
  trailingIcon?: IconType;

  /** If set to `true`, displays the item's icon in an disabled state. */
  disableTrailingIcon?: boolean;

  /** An optional listener that is called when the icon is pressed. */
  onTrailingIconPress?: (value?: string) => void;

  /**
   * If set to `true`, signals that this is the last item and the following
   * divider should thus be omitted.
   */
  isLast?: boolean;
}
