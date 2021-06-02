import React from "react";

import { IBooleanParameter } from "../../types";
import { Switch } from "../switch";

const booleanSwitchItems = [
  { labelTx: "on", value: true },
  { labelTx: "off", value: false },
];

export type BooleanParamProps = IBooleanParameter &
  Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">;

export const BooleanParam: React.FC<BooleanParamProps> = ({
  labelTx,
  label,
  value,
  setValue,

  defaultValue,
  kind,
  name,
  ...rest
}) => (
  <Switch
    {...rest}
    labelTx={labelTx}
    label={label}
    items={booleanSwitchItems}
    value={Boolean(value)}
    onChange={setValue}
  />
);
