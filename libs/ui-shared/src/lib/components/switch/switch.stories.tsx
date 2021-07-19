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
    (newValue: string) => {
      setValue(newValue);
      if (onChange) onChange(newValue);
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
