import type { IconType, ButtonProps } from "@visian/ui-shared";

export interface Shortcut {
  icons: IconType[];
  tx?: string;
  text?: string;
}

export interface InfoTextProps
  extends Omit<ButtonProps, "tooltipPosition" | "isActive"> {
  infoTx?: string;
  infoText?: string;

  shortcuts?: Shortcut[];
}
