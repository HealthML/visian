import type React from "react";
import type { I18nProps } from "../types";
import type { TooltipPositionConfig } from "./utils";

export interface TooltipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    I18nProps,
    Pick<TooltipPositionConfig, "parentElement" | "position" | "distance"> {
  isShown?: boolean;

  /** The z-index of the surface below. */
  baseZIndex?: number;
}
