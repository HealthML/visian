import React from "react";

import { IEnumParameter } from "../../types";
import { Switch } from "../switch";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnumParamProps<T = any> = IEnumParameter<T> &
  Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">;

// TODO: EnumParams with more or longer options should be rendered as a drop
// down selection field
export const EnumParam: React.FC<
  Partial<EnumParamProps> & Pick<EnumParamProps, "options">
> = ({
  labelTx,
  label,
  options,
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
    items={options}
    value={value}
    onChange={setValue}
  />
);
