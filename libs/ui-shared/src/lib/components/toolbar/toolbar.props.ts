import React from "react";

import { IconType } from "../icon";

export interface ToolProps extends React.HTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  icon?: IconType;
}

export type ToolbarProps = React.HTMLAttributes<HTMLDivElement>;
