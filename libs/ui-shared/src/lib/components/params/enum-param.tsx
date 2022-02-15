import React from "react";

import { IEnumParameter } from "../../types";
import { DropDown } from "../drop-down";
import { Switch, SwitchProps } from "../switch";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnumParamProps<T = any> = IEnumParameter<T> &
  Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> &
  Pick<
    SwitchProps,
    "infoTx" | "infoPosition" | "infoShortcuts" | "infoBaseZIndex"
  >;

export const EnumParam: React.FC<
  Partial<EnumParamProps> & Pick<EnumParamProps, "options">
> = ({
  labelTx,
  label,
  selector,
  options,
  value,
  setValue,

  defaultValue,
  onBeforeValueChange,
  kind,
  name,
  ...rest
}) =>
  selector === "switch" || (!selector && options.length <= 3) ? (
    <Switch
      {...rest}
      labelTx={labelTx}
      label={label}
      options={options}
      value={value}
      onChange={setValue}
    />
  ) : (
    <DropDown
      {...rest}
      labelTx={labelTx}
      label={label}
      options={options}
      value={value}
      onChange={setValue}
    />
  );
