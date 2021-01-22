import React from "react";

import { Text } from "../text";
import Button from "./button";
import { ButtonProps } from "./button.props";

export default {
  component: Button,
  title: "Button",
}

export const primary = (args: ButtonProps) => {
  return (<Button {...args}>
      <Text>This is a button!</Text>
    </Button>)
    ;
};
primary.args = {
  onClick: () => console.log("Button pressed"),
};
