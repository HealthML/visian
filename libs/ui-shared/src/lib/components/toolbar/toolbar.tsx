import React, { useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import styled, { css } from "styled-components";

import { ToolGroupProps, ToolProps } from "./toolbar.props";
import { useModalRoot } from "../box";
import { InvisibleButton } from "../button";
import { useModalPosition } from "../modal";
import { Sheet } from "../sheet";
import { useOutsidePress } from "../utils";

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
      isActive,
      isDisabled,
      onPress,
      onRelease,
      onPointerDown,
      onPointerUp,
      ...rest
    },
    ref,
  ) => {
    const handlePress = useCallback(
      (event: React.PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(event);
        if (isDisabled) return;
        onPress?.(value, event);
      },
      [isDisabled, onPointerDown, onPress, value],
    );
    const handleRelease = useCallback(
      (event: React.PointerEvent<HTMLButtonElement>) => {
        onPointerUp?.(event);
        if (isDisabled) return;
        onRelease?.(value, event);
      },
      [isDisabled, onPointerUp, onRelease, value],
    );

    return (
      <StyledButton
        {...rest}
        icon={icon}
        isActive={isActive}
        isDisabled={isDisabled}
        onPointerDown={handlePress}
        onPointerUp={handleRelease}
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
  border-bottom-left-radius: 0;
  border-left: 0;
  border-top-left-radius: 0;
  box-sizing: border-box;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  margin-top: 2px;
  padding: 0 4px;

  height: 36px;
`;

const ToolGroupHint = styled(ToolGroupContainer)<{ expand?: boolean }>`
  padding: 0;
  pointer-events: auto;
  transition: width 0.2s;
  width: 4px;

  ${(props) =>
    props.onPointerDown &&
    css`
      cursor: pointer;
    `}

  ${(props) =>
    props.expand &&
    css`
      width: 8px;
    `}

  &:hover {
    width: 8px;
  }
`;

export const ToolGroup: React.FC<ToolGroupProps> = ({
  anchor,
  position,
  distance = 0,
  showHint = true,
  expandHint,
  onPressHint,

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
  useOutsidePress(ref, handleOutsidePress, isOpen, true);

  const modalRootRef = useModalRoot();

  const modalStyle = useModalPosition({
    anchor,
    isActive: (isOpen || showHint) && Boolean(anchor),
    positionRelativeToOffsetParent: !modalRootRef.current,
    position,
    distance,
    style,
  });

  const node =
    isOpen === false ? (
      showHint ? (
        <ToolGroupHint
          {...rest}
          expand={expandHint}
          style={anchor ? modalStyle : undefined}
          onPointerDown={onPressHint}
        />
      ) : null
    ) : (
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
