import React from "react";
import styled from "styled-components";

import { Sheet } from "../sheet";
import { ButtonProps } from "./button.props";

const BaseButton: React.FC<ButtonProps> = ({
  onClick,
  children,
  ...rest
}) => {
  return (
    <Sheet {...rest} onClick={onClick}>
      {children}
    </Sheet>
  );
};

export const Button = styled(BaseButton)`
  cursor: pointer;
  display: inline-block;
  padding: 10px;
`

export default Button;