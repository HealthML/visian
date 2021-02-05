import { Sheet } from "@classifai/ui-shared";
import React from "react";
import styled from "styled-components";

import { ToolBarProps } from ".";

const Container = styled(Sheet)`
  width: 100px;
  height: 200px;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
`;

const ToolBar: React.FC<ToolBarProps> = (props) => {
  const { renderer, ...rest } = props;

  return <Container {...rest}>I am a Toolbar.</Container>;
};

export default ToolBar;
