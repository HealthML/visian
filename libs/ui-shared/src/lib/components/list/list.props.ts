import React from "react";

import { IconType } from "../icon";

export type ListProps = React.HTMLAttributes<HTMLDivElement>;

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  labelTx?: string;
  label?: string;

  icon?: IconType;
  iconDisabled?: boolean;
  lastItem?: boolean;
}
