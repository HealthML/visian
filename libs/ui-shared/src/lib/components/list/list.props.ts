import React from "react";

import { IconType } from "../icon";

export type ListProps = React.HTMLAttributes<HTMLDivElement>;

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  labelTx?: string;
  label?: string;

  /** The key of the list item's icon (if any). */
  icon?: IconType;

  /** If set to `true`, displays the item's icon in an disabled state. */
  disableIcon?: boolean;

  /** An optional value to pass to the item's listeners. */
  value?: string;

  /** An optional listener that is called when the icon is pressed. */
  onIconPress?: (value?: string) => void;

  /**
   * If set to `true`, signals that this is the last item and the following
   * divider should thus be omitted.
   */
  isLast?: boolean;
}
