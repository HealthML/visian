import React from "react";
import { I18nProps } from "../types";

export interface TooltipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    I18nProps {
  isShown?: boolean;

  /** The z-index of the surface below. */
  baseZIndex?: number;
}
