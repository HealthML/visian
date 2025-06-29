import React from "react";

import { TextField } from "./text-field";
import { TextFieldProps } from "./text-field.props";

export default {
  cmponent: TextField,
  title: "TextField",
  argTypes: { onEdit: { action: "New Value" } },
};

export const primary = (args: TextFieldProps) => <TextField {...args} />;
primary.args = {
  placeholder: "Placeholder",
};

export const password = (args: TextFieldProps) => <TextField {...args} />;
password.args = {
  placeholder: "Password",
  type: "password",
};
