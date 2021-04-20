import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { zIndex } from "../../theme";
import { useModalRoot } from "../box";
import { Sheet } from "../sheet";
import { Text } from "../text";
import { TooltipProps } from "./tooltip.props";

const TooltipContainer = styled(Sheet).withConfig({
  shouldForwardProp: (prop) => prop.toString() !== "isActive",
})<Pick<TooltipProps, "baseZIndex">>`
  box-sizing: border-box;
  height: 24px;
  border-radius: 12px;
  padding: 0 14px;
  z-index: ${(props) =>
    (props.baseZIndex === undefined
      ? (zIndex("overlay")(props) as number)
      : props.baseZIndex) + 1};
`;

const TooltipLabel = styled(Text)`
  font-size: 12px;
  line-height: 12px;
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
  const modalRootRef = useModalRoot();

  const node =
    isShown === false ? null : (
      <TooltipContainer {...rest}>
        <TooltipLabel tx={tx} data={data} text={text} />
      </TooltipContainer>
    );

  return modalRootRef.current
    ? ReactDOM.createPortal(node, modalRootRef.current)
    : node;
};
