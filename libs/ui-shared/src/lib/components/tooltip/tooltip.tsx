import React from "react";
import styled from "styled-components";

import { Sheet } from "../sheet";
import { Text } from "../text";
import { TooltipProps } from "./tooltip.props";

const TooltipContainer = styled(Sheet)`
  height: 16px;
  border-radius: 10px;
  padding: 0 14px;
`;

const TooltipLabel = styled(Text)`
  font-size: 9px;
  line-height: 9px;
`;

export const Tooltip: React.FC<TooltipProps> = ({
  labelTx,
  label,
  ...rest
}) => {
  return (
    <TooltipContainer {...rest}>
      <TooltipLabel tx={labelTx} text={label} />
    </TooltipContainer>
  );
};
