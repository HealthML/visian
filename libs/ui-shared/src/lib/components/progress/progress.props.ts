import type React from "react";

import { Theme } from "../../theme";

type Bar = {
  value: number;
  color: keyof Theme["colors"];
  label?: string;
  labelTx?: string;
};

export interface ProgressProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  total: number;
  totalLabel?: string;
  totalLabelTx?: string;
  bars: Bar[];
}
