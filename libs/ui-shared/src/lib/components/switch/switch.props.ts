import React from "react";
import { ModalPosition } from "../modal";
import { IEnumParameterOption } from "../../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SwitchProps<T = any>
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange"
  > {
  labelTx?: string;
  label?: string;

  infoTx?: string;
  infoPosition?: ModalPosition;

  options: IEnumParameterOption<T>[];

  defaultValue?: T;
  value?: T;
  onChange?: (value: T) => void;
}
