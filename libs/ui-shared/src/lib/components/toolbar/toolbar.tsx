import React, { useCallback } from "react";
import styled from "styled-components";

import { ButtonProps, InvisibleButton } from "../button";
import { Icon } from "../icon";
import { Sheet } from "../sheet";
import { ToolbarProps, ToolProps } from "./toolbar.props";

const ToolbarContainer = styled(Sheet)`
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  padding: 6px 0;

  width: 40px;
`;

const StyledButton = styled(InvisibleButton)<
  Omit<ButtonProps & ToolProps, "icon">
>`
  width: 40px;
  height: 40px;
  opacity: ${(props) => (props.isActive ? 1 : 0.3)};
`;

export const Tool: React.FC<ToolProps> = ({
  children,
  icon,
  value,
  activeTool,
  isActive,
  onPress,
  onPointerDown,
  ...rest
}) => {
  const handlePress = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (onPointerDown) onPointerDown(event);
      if (onPress) onPress(value);
    },
    [onPointerDown, onPress, value],
  );

  return (
    <StyledButton
      {...rest}
      isActive={isActive || (activeTool !== undefined && value === activeTool)}
      onPointerDown={handlePress}
    >
      {icon ? <Icon icon={icon} /> : children}
    </StyledButton>
  );
};

export const Toolbar: React.FC<ToolbarProps> = ({ children, ...rest }) => (
  <ToolbarContainer {...rest}>{children}</ToolbarContainer>
);
