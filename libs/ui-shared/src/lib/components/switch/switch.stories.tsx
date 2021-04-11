import React, { useCallback, useState } from "react";

import { Switch } from "./switch";
import { SwitchProps } from "./switch.props";

export default {
  component: Switch,
  title: "Switch",
};

const Template = ({ onChange, ...args }: SwitchProps) => {
  const [value, setValue] = useState<string>();
  const changeHandler = useCallback(
    (value: string) => {
      setValue(value);
      if (onChange) onChange(value);
    },
    [onChange],
  );

  return <Switch {...args} value={value} onChange={changeHandler} />;
};

export const primary = (args: SwitchProps) => Template(args);
primary.args = {
  label: "Theme",
  items: [
    { value: "Light" },
    { value: "Dark" },
    { value: "Bright" },
    { value: "Night" },
  ],
};
