import React from "react";

import { IconType } from "../icon";

export interface ListProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
  labelTx?: string;
  label?: string;
  icon?: IconType;
}
