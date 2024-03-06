import type React from "react";

import type { TooltipPositionConfig } from "./utils";
import type { I18nProps } from "../types";

export interface TooltipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    I18nProps,
    Pick<TooltipPositionConfig, "anchor" | "position" | "distance"> {
  /** The z-index of the surface below. */
  baseZIndex?: number;

  isShown?: boolean;
}
