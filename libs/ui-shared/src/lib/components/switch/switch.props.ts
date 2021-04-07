import React from "react";

import { SwitchItemType } from "./switch-item.props";

export interface SwitchProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange"
  > {
  labelTx?: string;
  label?: string;

  items: SwitchItemType[];

  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}
