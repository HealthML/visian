import React from "react";

import { IEnumParameterOption } from "../../types";
import { ModalPosition } from "../modal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SwitchProps<T = any>
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onChange"
  > {
  labelTx?: string;
  label?: string;

  infoTx?: string;
  infoShortcuts?: React.ReactNode;
  infoPosition?: ModalPosition;
  infoBaseZIndex?: number;

  options: IEnumParameterOption<T>[];

  defaultValue?: T;
  value?: T;
  onChange?: (value: T) => void;
}
