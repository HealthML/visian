import { Button } from "@classifai/ui-shared";
import React from "react";
import styled from "styled-components";

import { ARButtonProps } from ".";

const StyledButton = styled(Button)`
  display: flex;
  flex-direction: row;
  margin-left: 10px;
  padding: 5px;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  pointer-events: auto;
`;

const ARButton: React.FC<ARButtonProps> = (props) => {
  const { renderer, ...rest } = props;

  return <StyledButton {...rest} text="AR" onPointerDown={renderer.enterAR} />;
};

export default ARButton;
