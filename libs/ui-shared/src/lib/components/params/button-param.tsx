import React from "react";
import styled from "styled-components";

import { ListPositionProps } from "./types";
import { color } from "../../theme";
import { IButtonParameter } from "../../types";
import { Button, ButtonProps } from "../button";
import { sheetNoise } from "../sheet";

const StyledButton = styled(Button)<ListPositionProps>`
  width: 100%;
  margin-bottom: ${(props) => (props.isLast ? "0" : "16px")};
`;

export type ButtonParamProps = IButtonParameter &
  ListPositionProps &
  ButtonProps &
  React.HTMLAttributes<HTMLButtonElement>;

export const ButtonParam: React.FC<Partial<ButtonParamProps>> = ({
  labelTx,
  label,
  tooltipTx,
  tooltip,
  tooltipPosition,
  handlePress,

  defaultValue,
  onBeforeValueChange,
  kind,
  name,
  ...rest
}) => (
  <StyledButton
    {...rest}
    tx={labelTx}
    text={label}
    tooltipTx={tooltipTx}
    tooltip={tooltip}
    tooltipPosition={tooltipPosition}
    onPointerDown={handlePress}
  />
);

export const ColoredButtonParam = styled(ButtonParam)<{
  color: "green" | "red" | "blue";
}>`
  background: ${sheetNoise},
    ${({ color: buttonColor }) => color(`${buttonColor}Sheet`)};
  border-color: ${({ color: buttonColor }) => color(`${buttonColor}Border`)};

  &:active {
    border-color: ${({ color: buttonColor }) =>
      color(`${buttonColor}BorderFocus`)};
  }
`;

export const ColoredBorderButtonParam = styled(ButtonParam)<{
  color: "green" | "red" | "blue";
}>`
  border-color: ${({ color: buttonColor }) => color(`${buttonColor}Border`)};
  border-width: 2px;

  &:active {
    border-color: ${({ color: buttonColor }) =>
      color(`${buttonColor}BorderFocus`)};
  }
`;
