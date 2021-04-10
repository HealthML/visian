import React from "react";
import styled from "styled-components";

import { ButtonProps } from ".";
import { color, fontWeight, radius, size, space } from "../../theme";
import { sheetMixin } from "../sheet";
import { Text } from "../text";

const StyledText = styled(Text)`
  font-weight: ${fontWeight("regular")};
  line-height: 16px;
  font-size: 16px;
`;

const StyledButton = styled.button`
  ${sheetMixin}

  display: flex;
  align-items: center;
  justify-content: center;
`;

const BaseButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, data, text, tx, ...rest }, ref) => (
    <StyledButton {...rest} ref={ref}>
      {tx || text ? <StyledText data={data} text={text} tx={tx} /> : children}
    </StyledButton>
  ),
);

export const Button = styled(BaseButton)`
  border-radius: ${radius("default")};
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

export const CircularButton = styled(Button)`
  border-radius: 50%;
`;

export const InvisibleButton = styled(BaseButton)`
  background: none;
  border: none;
  outline: none;
  padding: 0;

  box-sizing: border-box;
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
`;

export default Button;
