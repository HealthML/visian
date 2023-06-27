import ReactDOM from "react-dom";
import styled from "styled-components";

import { useModalRoot } from "../box";
import { Divider } from "../modal";
import { Sheet } from "../sheet";
import { Text } from "../text";
import { useTooltipPosition } from "../tooltip";
import { Dot } from "./progress";
import { ProgressProps } from "./progress.props";

const TooltipContainer = styled(Sheet)`
  box-sizing: border-box;
  border-radius: 10px;
  max-width: fit-content;
  padding: 8px 14px;
`;

const TooltipLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  width: 100%;
  min-width: 140px;

  /* Required to account for non-aligned text spans */
  span {
    padding-top: 3px;
  }
`;

const TooltipLabelValue = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const TooltipDivider = styled(Divider)`
  margin: 4px 0;
`;

// This component is very similar to the tooltip component, but uses specific
// positioning and custom children.
export const ProgressTooltip: React.FC<
  {
    isShown: boolean;
    anchor: HTMLElement | null;
  } & ProgressProps
> = ({ total, totalLabel, totalLabelTx, bars, isShown, anchor }) => {
  const modalRootRef = useModalRoot();

  const tooltipStyle = useTooltipPosition({
    anchor,
    isActive: isShown,
    positionRelativeToOffsetParent: !modalRootRef.current,
    position: "bottom",
    distance: 10,
  });

  const node =
    isShown === false ? null : (
      <TooltipContainer style={tooltipStyle}>
        {bars?.map((bar) => (
          <TooltipLabel>
            <Text tx={bar.labelTx} text={bar.label} />
            <TooltipLabelValue>
              <Dot dotColor={bar.color} />
              <Text>{bar.value}</Text>
            </TooltipLabelValue>
          </TooltipLabel>
        ))}
        <TooltipDivider />
        <TooltipLabel>
          <Text tx={totalLabelTx} text={totalLabel} />
          <TooltipLabelValue>
            <Text>{total}</Text>
          </TooltipLabelValue>
        </TooltipLabel>
      </TooltipContainer>
    );

  return modalRootRef.current
    ? ReactDOM.createPortal(node, modalRootRef.current)
    : node;
};
