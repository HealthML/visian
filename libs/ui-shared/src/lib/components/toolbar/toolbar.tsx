import React, { useCallback } from "react";
import styled, { StyledComponentProps } from "styled-components";

import { Theme } from "../../theme";
import { ButtonProps, InvisibleButton } from "../button";
import { Sheet } from "../sheet";
import { ToolbarProps, ToolProps } from "./toolbar.props";

const ToolbarContainer = styled(Sheet)`
  box-sizing: border-box;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  padding: 6px 0;
  position: static;

  width: 40px;
`;

const StyledButton = styled(InvisibleButton)<
  Omit<ButtonProps & ToolProps, "icon">
>`
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

export const Toolbar = React.forwardRef<
  HTMLDivElement,
  StyledComponentProps<"div", Theme, ToolbarProps, never>
>(({ children, ...rest }, ref) => (
  <ToolbarContainer ref={ref} {...rest}>
    {children}
  </ToolbarContainer>
));
