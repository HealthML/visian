import React from "react";
import styled from "styled-components";

import { IButtonParameter } from "../../types";
import { Button } from "../button";
import { IsLastProps } from "./types";

const StyledButton = styled(Button)<IsLastProps>`
  width: 100%;
  margin-bottom: ${(props) => (props.isLast ? "0" : "16px")};
`;

export type ButtonParamProps = IButtonParameter &
  IsLastProps &
  React.HTMLAttributes<HTMLButtonElement>;

export const ButtonParam: React.FC<Partial<ButtonParamProps>> = ({
  labelTx,
  label,
  tooltipTx,
  tooltip,
  tooltipPosition,
  handlePress,

  defaultValue,
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
