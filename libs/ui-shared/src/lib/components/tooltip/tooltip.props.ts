import React from "react";

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  labelTx?: string;
  label?: string;
}
