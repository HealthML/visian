import React from "react";

import { IBooleanParameter } from "../../types";
import { Switch } from "../switch";

const booleanSwitchItems = [
  { labelTx: "off", value: false },
  { labelTx: "on", value: true },
];

export type BooleanParamProps = IBooleanParameter &
  Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">;

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
    options={booleanSwitchItems}
    value={Boolean(value)}
    onChange={setValue}
  />
);
