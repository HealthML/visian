import React from "react";
import styled from "styled-components";
import { ButtonProps } from ".";
import { color, fontWeight, size, space } from "../../theme";
import { Sheet } from "../sheet";
import { Text } from "../text";

const StyledText = styled(Text)`
  font-weight: ${fontWeight("regular")};
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
  height: ${size("buttonHeight")};
  padding: ${space("buttonPadding")};
  pointer-events: auto;
  user-select: none;

  &:active {
    border-color: ${color("text")};
    outline: none;
  }
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
