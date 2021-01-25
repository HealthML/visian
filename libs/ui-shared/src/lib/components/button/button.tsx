import React from "react";
import styled from "styled-components";

import { ButtonProps } from ".";
import { Sheet } from "..";
import { color, fontWeight, size, space } from "../../theme";
import { Text } from "../text";

const StyledText = styled(Text)`
  font-weight: ${fontWeight("bold")};
`;

const BaseButton: React.FC<ButtonProps> = ({
  children,
  data,
  text,
  tx,
  ...rest
}) => (
  <Sheet {...rest} as="button">
    {tx || text ? <StyledText data={data} text={text} tx={tx} /> : children}
  </Sheet>
);

export const Button = styled(BaseButton)`
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  padding: ${space("buttonPadding")};
  height: ${size("buttonHeight")};

  &:focus {
    border-color: ${color("text")};
    outline: none;
  }
`;

export const SquareButton = styled(Button)`
  padding: 0;
  width: ${size("buttonHeight")};
`;

export const CircularButton = styled(SquareButton)`
  border-radius: 50%;
`;

export default Button;
