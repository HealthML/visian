import { Button } from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";

import { ARButtonProps } from ".";

const StyledButton = styled(Button)`
  display: flex;
  flex-direction: row;
  margin-left: 12px;
  padding: 5px;
  justify-content: center;
  align-items: center;
  width: 46px;
  height: 46px;
  pointer-events: auto;
`;

const ARButton: React.FC<ARButtonProps> = (props) => {
  const { renderer, ...rest } = props;

  return <StyledButton {...rest} text="AR" onPointerDown={renderer.enterAR} />;
};

export default ARButton;
