import React, { useCallback, useState } from "react";

import { TextInput } from "./text-input";
import { TextInputProps } from "./text-input.props";

export default {
  cmponent: TextInput,
  title: "TextInput",
  argTypes: {
    onChangeText: { action: "New Value" },
    onCancel: { action: "Edit Cancelled" },
    onConfirm: { action: "Edit Confirmed" },
  },
};

const Template = ({ onConfirm, ...args }: TextInputProps) => {
  const [value, setValue] = useState<unknown>(args.value || args.defaultValue);
  const handleConfirm = useCallback(
    (newValue: unknown) => {
      setValue(newValue);
      if (onConfirm) onConfirm(newValue);
    },
    [onConfirm],
  );

  return <TextInput {...args} value={value} onConfirm={handleConfirm} />;
};

export const primary = (args: TextInputProps) => Template(args);
primary.args = {
  placeholder: "Placeholder",
};

export const number = (args: TextInputProps) => Template(args);
number.args = {
  placeholder: "Number",
  type: "number",
};
