import type React from "react";

export type IconType =
  | "arrowDown"
  | "arrowUp"
  | "erase"
  | "export"
  | "layers"
  | "magicBrush"
  | "menu"
  | "moveTool"
  | "pixelBrush"
  | "settings"
  | "trash";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: IconType;
}
