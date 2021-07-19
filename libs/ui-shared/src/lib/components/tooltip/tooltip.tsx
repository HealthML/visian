import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { zIndex } from "../../theme";
import { useModalRoot } from "../box";
import { Sheet } from "../sheet";
import { Text } from "../text";
import { TooltipProps } from "./tooltip.props";
import { useTooltipPosition } from "./utils";

const TooltipContainer = styled(Sheet)<Pick<TooltipProps, "baseZIndex">>`
  box-sizing: border-box;
  height: 20px;
  border-radius: 10px;
  padding: 0 14px;
  z-index: ${(props) =>
    (props.baseZIndex === undefined
      ? (zIndex("overlay")(props) as number)
      : props.baseZIndex) + 1};
`;

const TooltipLabel = styled(Text)`
  font-size: 11px;
  line-height: 11px;
  white-space: nowrap;
`;

export const Tooltip: React.FC<TooltipProps> = ({
  tx,
  data,
  text,
  isShown,
  anchor,
  position,
  distance,
  style,
  ...rest
}) => {
  const modalRootRef = useModalRoot();

  const tooltipStyle = useTooltipPosition({
    anchor,
    isActive: isShown,
    positionRelativeToOffsetParent: !modalRootRef.current,
    position,
    distance,
    style,
  });

  const node =
    isShown === false ? null : (
      <TooltipContainer {...rest} style={tooltipStyle}>
        <TooltipLabel tx={tx} data={data} text={text} />
      </TooltipContainer>
    );

  return modalRootRef.current
    ? ReactDOM.createPortal(node, modalRootRef.current)
    : node;
};
