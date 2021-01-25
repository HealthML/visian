import React from "react";

import TextInput from "./text-input";
import { TextInputProps } from "./text-input.props";

export default {
  cmponent: TextInput,
  title: "TextInput",
  argTypes: { onEdit: { action: "New Value" } },
};

export const primary = (args: TextInputProps) => {
  return <TextInput {...args} />;
};
primary.args = {
  placeholder: "Placeholder",
};

export const password = (args: TextInputProps) => {
  return <TextInput {...args} />;
};
password.args = {
  placeholder: "Password",
  type: "password",
};
