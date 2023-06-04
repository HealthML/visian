import type React from "react";
import { Theme } from "../../theme";

type Bar = {
  value: number;
  color: keyof Theme["colors"];
  label?: string;
};

export interface ProgressProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  total: number;
  totalLabel: string;
  bars: Bar[];
}
