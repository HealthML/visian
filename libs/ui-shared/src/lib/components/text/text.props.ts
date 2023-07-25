import type React from "react";

import { TooltipPosition } from "../tooltip";
import type { AsProps, I18nProps } from "../types";

export interface TextProps extends AsProps, I18nProps {
  children?: React.ReactNode;
}

export interface TextWithTooltipProps extends TextProps {
  tooltip?: string;
  tooltipTx?: string;
  tooltipPosition?: TooltipPosition;
  showTooltip?: boolean;
}
