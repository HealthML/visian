import React from "react";

import { Text } from "../text";
import Button, { CircularButton, SquareButton } from "./button";
import { ButtonProps } from "./button.props";

export default {
  component: Button,
  title: "Button",
};

export const primary = (args: ButtonProps) => {
  return (
    <Button {...args}>
      <Text>This is a button!</Text>
    </Button>
  );
};
primary.args = {
  onClick: () => console.log("Button pressed"),
};

export const square = (args: ButtonProps) => {
  return (
    <SquareButton {...args}>
      <Text>S</Text>
    </SquareButton>
  );
};
square.args = {
  onClick: () => console.log("Button pressed"),
};

export const circular = (args: ButtonProps) => {
  return (
    <CircularButton {...args}>
      <Text>C</Text>
    </CircularButton>
  );
};
circular.args = {
  onClick: () => console.log("Button pressed"),
};
