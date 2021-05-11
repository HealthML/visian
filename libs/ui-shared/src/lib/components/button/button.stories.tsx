import React from "react";

import Button, { CircularButton, SquareButton } from "./button";
import { ButtonProps } from "./button.props";

export default {
  component: Button,
  title: "Button",
  argTypes: { onClick: { action: "onClick" } },
};

export const primary = (args: ButtonProps) => <Button {...args} />;
primary.args = {
  text: "Click Me",
};

export const square = (args: ButtonProps) => <SquareButton {...args} />;
square.args = {
  text: "S",
};

export const circular = (args: ButtonProps) => <CircularButton {...args} />;
circular.args = {
  text: "C",
};
