import type React from "react";
import type { IconType } from "../icon";
import type { TooltipPosition } from "../tooltip";
import type { I18nProps } from "../types";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    I18nProps {
  /** The key of the button's icon (if any). */
  icon?: IconType;

  tooltip?: string;
  tooltipTx?: string;
  tooltipPosition?: TooltipPosition;
  showTooltip?: boolean;

  isActive?: boolean;
  isDisabled?: boolean;
}
