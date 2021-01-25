import React from "react";

import TextInput from "./textInput";
import { TextInputProps } from "./textInput.props";

export default {
  cmponent: TextInput,
  title: "TextInput",
  argTypes: { onEdit: { action: "New Value" } }
}

export const primary = (args: TextInputProps) => {
  return (<TextInput {...args} />);
};
primary.args = {
  placeholderText: "Placeholder",
};

export const password = (args: TextInputProps) => {
  return (<TextInput {...args} />);
};
password.args = {
  placeholderText: "Password",
  type: "password",
};