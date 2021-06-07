import React from "react";
import styled from "styled-components";

import { IButtonParameter } from "../../types";
import { Button } from "../button";
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
