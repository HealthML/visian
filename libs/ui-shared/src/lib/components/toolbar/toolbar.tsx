import React, { useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { useModalRoot } from "../box";
import { InvisibleButton } from "../button";
import { useModalPosition } from "../modal";
import { Sheet } from "../sheet";
import { useOutsidePress } from "../utils";
import { ToolGroupProps, ToolProps } from "./toolbar.props";

const StyledButton = styled(InvisibleButton)`
  width: 40px;
  height: 40px;
`;

export const Tool = React.forwardRef<HTMLButtonElement, ToolProps>(
  (
    {
      children,
      icon,
      value,
      activeTool,
      isActive,
      isDisabled,
      onPress,
      onPointerDown,
      ...rest
    },
    ref,
  ) => {
    const handlePress = useCallback(
      (event: React.PointerEvent<HTMLButtonElement>) => {
        if (onPointerDown) onPointerDown(event);
        if (isDisabled) return;
        if (onPress) onPress(value, event);
      },
      [isDisabled, onPointerDown, onPress, value],
    );

    return (
      <StyledButton
        {...rest}
        icon={icon}
        isActive={
          isActive || (activeTool !== undefined && value === activeTool)
        }
        isDisabled={isDisabled}
        onPointerDown={handlePress}
        ref={ref}
      />
    );
  },
);

export const Toolbar = styled(Sheet)`
  box-sizing: border-box;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  padding: 6px 0;
  position: static;

  width: 40px;
`;

const ToolGroupContainer = styled(Sheet)`
  box-sizing: border-box;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  padding: 0 6px;
  position: static;

  height: 40px;
`;

export const ToolGroup: React.FC<ToolGroupProps> = ({
  anchor,
  position,
  distance,

  baseZIndex,
  children,
  isOpen,
  onOutsidePress,
  style,
  value,
  ...rest
}) => {
  const handleOutsidePress = useCallback(() => {
    if (onOutsidePress) onOutsidePress(value);
  }, [onOutsidePress, value]);

  const ref = useRef<HTMLDivElement>(null);
  useOutsidePress(ref, handleOutsidePress, isOpen);

  const modalRootRef = useModalRoot();

  const modalStyle = useModalPosition({
    anchor,
    isActive: isOpen && Boolean(anchor),
    positionRelativeToOffsetParent: !modalRootRef.current,
    position,
    distance,
    style,
  });

  const node =
    isOpen === false ? null : (
      <ToolGroupContainer
        {...rest}
        style={anchor ? modalStyle : undefined}
        ref={ref}
      >
        {children}
      </ToolGroupContainer>
    );

  return modalRootRef.current && anchor
    ? ReactDOM.createPortal(node, modalRootRef.current)
    : node;
};
