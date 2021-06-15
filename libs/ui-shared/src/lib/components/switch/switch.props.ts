import React from "react";
import { IEnumParameterOption } from "../../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SwitchProps<T = any>
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange"
  > {
  labelTx?: string;
  label?: string;

  options: IEnumParameterOption<T>[];

  defaultValue?: T;
  value?: T;
  onChange?: (value: T) => void;
}
