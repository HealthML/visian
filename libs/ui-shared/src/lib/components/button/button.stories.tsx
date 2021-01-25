import React from "react";

import { Text } from "../text";
import Button, { CircularButton, SquareButton } from "./button";
import { ButtonProps } from "./button.props";

export default {
  component: Button,
  title: "Button",
  argTypes: { onClick: { action: "Button clicked!" } },
};

export const primary = (args: ButtonProps) => {
  return <Button {...args} />;
};
primary.args = {
  text: "Click Me",
};

export const square = (args: ButtonProps) => {
  return <SquareButton {...args} />;
};
square.args = {
  text: "S",
};

export const circular = (args: ButtonProps) => {
  return <CircularButton {...args} />;
};
circular.args = {
  text: "C",
};
