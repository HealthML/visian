import type React from "react";
import type * as icons from "./icons";

export type IconType = keyof typeof icons;

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: IconType;
  color?: string;

  isActive?: boolean;
}
