import React from "react";
import styled from "styled-components";

import { color } from "../../theme";
import { IButtonParameter } from "../../types";
import { Button } from "../button";
import { sheetNoise } from "../sheet";
import { ListPositionProps } from "./types";

const StyledButton = styled(Button)<ListPositionProps>`
  width: 100%;
  margin-bottom: ${(props) => (props.isLast ? "0" : "16px")};
`;

export type ButtonParamProps = IButtonParameter &
  ListPositionProps &
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

export const BlueButtonParam = styled(ButtonParam)`
  background: ${sheetNoise}, ${color("blueSheet")};
  border-color: ${color("blueBorder")};

  &:active {
    border-color: rgba(0, 133, 255, 1);
  }
`;

export const RedButtonParam = styled(ButtonParam)`
  background: ${sheetNoise}, ${color("redSheet")};
  border-color: ${color("redBorder")};

  &:active {
    border-color: rgba(202, 51, 69, 1);
  }
`;
