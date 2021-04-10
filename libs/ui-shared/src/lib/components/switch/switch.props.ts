import React from "react";

import { SwitchItemType } from "./switch-item.props";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SwitchProps<T = any>
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange"
  > {
  labelTx?: string;
  label?: string;

  items: SwitchItemType[];

  defaultValue?: string;
  value?: T;
  onChange?: (value: T) => void;
}
