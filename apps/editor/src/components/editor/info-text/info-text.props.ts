import type { IconType, ButtonProps } from "@visian/ui-shared";

export interface Shortcut {
  icons: IconType[];
  tx?: string;
  text?: string;
}

export interface InfoTextProps
  extends Omit<ButtonProps, "tooltipPosition" | "isActive"> {
  titleTx?: string;

  infoTx?: string;
  infoText?: string;

  shortcuts?: Shortcut[];

  /** The z-index of the surface below. */
  baseZIndex?: number;
}
