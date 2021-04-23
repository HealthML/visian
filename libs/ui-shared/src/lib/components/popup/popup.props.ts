import React from "react";

export interface PopUpProps extends React.HTMLAttributes<HTMLDivElement> {
  labelTx?: string;
  label?: string;
  secondaryLabel?: string;
  secondaryLabelTx?: string;
}
