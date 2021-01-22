import React from "react";
import styled from "styled-components";

import { Sheet } from "../sheet";
import { ButtonProps } from "./button.props";

const BaseButton: React.FC<ButtonProps> = ({
  onClick,
  children,
  ...rest
}) => (
  <Sheet {...rest} onClick={onClick}>
    {children}
  </Sheet>
);

export const Button = styled(BaseButton)`
  cursor: pointer;
  display: inline-flex;
  padding: 10px; // Todo: get this from theme
  height: 30px; // Todo: get this from theme
`

export const SquareButton = styled(Button)`
  width: 30px; // Todo: get this from theme
`

export const CircularButton = styled(SquareButton)`
  border-radius: 50%;
`

export default Button;