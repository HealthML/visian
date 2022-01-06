import React from "react";

import { IBooleanParameter } from "../../types";
import { Switch, SwitchProps } from "../switch";

const booleanSwitchOptions = [
  { labelTx: "off", value: false },
  { labelTx: "on", value: true },
];

export type BooleanParamProps = IBooleanParameter &
  Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> &
  Pick<SwitchProps, "infoTx" | "infoPosition" | "infoBaseZIndex">;

export const BooleanParam: React.FC<Partial<BooleanParamProps>> = ({
  labelTx,
  label,
  value,
  setValue,

  defaultValue,
  onBeforeValueChange,
  kind,
  name,
  ...rest
}) => (
  <Switch
    {...rest}
    labelTx={labelTx}
    label={label}
    options={booleanSwitchOptions}
    value={Boolean(value)}
    onChange={setValue}
  />
);
