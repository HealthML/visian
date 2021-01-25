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
  return (
    <Button {...args} />
  );
};
primary.args = {
  children: [<Text>This is a button!</Text>],
}

export const square = (args: ButtonProps) => {
  return (
    <SquareButton {...args} />
  );
};
square.args = {
  children: [<Text>S</Text>],
}

export const circular = (args: ButtonProps) => {
  return (
    <CircularButton {...args} />
  );
};
circular.args = {
  children: [<Text>C</Text>],
}
