import React from "react";
import styled from "styled-components";

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

const StyledButton = styled.button<Omit<ToolProps, "icon">>`
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  outline: none;
  opacity: ${(props) => (props.isActive ? 1 : 0.3)};
  padding: 0;
`;

export const Tool: React.FC<ToolProps> = ({ children, icon, ...rest }) => {
  return (
    <StyledButton {...rest}>
      {icon ? <Icon icon={icon} /> : children}
    </StyledButton>
  );
};

export const Toolbar: React.FC<ToolbarProps> = ({ children, ...rest }) => (
  <ToolbarContainer {...rest}>{children}</ToolbarContainer>
);
