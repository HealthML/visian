import React from "react";
import styled from "styled-components";

import { Sheet } from "../sheet";
import { Text } from "../text";
import { TooltipProps } from "./tooltip.props";

const TooltipContainer = styled(Sheet)`
  box-sizing: border-box;
  height: 16px;
  border-radius: 10px;
  padding: 0 14px;
`;

const TooltipLabel = styled(Text)`
  font-size: 9px;
  line-height: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Tooltip: React.FC<TooltipProps> = ({
  tx,
  data,
  text,
  isShown,
  ...rest
}) => {
  return isShown === false ? null : (
    <TooltipContainer {...rest}>
      <TooltipLabel tx={tx} data={data} text={text} />
    </TooltipContainer>
  );
};
