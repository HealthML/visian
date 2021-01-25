import React from "react";
import styled from "styled-components";

import { ButtonProps } from ".";
import { Sheet } from "..";
import { size, space } from "../../theme";

const BaseButton: React.FC<ButtonProps> = ({ children, ...rest }) => (
  <Sheet {...rest} as="button" >
    {children}
  </Sheet>
);

export const Button = styled(BaseButton)`
  cursor: pointer;
  display: inline-flex;
  padding: ${space("buttonPadding")};
  height: ${size("buttonHeight")};
`;

export const SquareButton = styled(Button)`
  width: ${size("buttonHeight")};
`;

export const CircularButton = styled(SquareButton)`
  border-radius: 50%;
`;

export default Button;
