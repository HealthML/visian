import { Sheet } from "@classifai/ui-shared";
import React from "react";
import styled from "styled-components";

import { ARButtonProps } from ".";

const Container = styled(Sheet)`
  display: flex;
  flex-direction: row;
  margin-left: 10px;
  padding: 5px;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  pointer-events: auto;
`;

const ARButton: React.FC<ARButtonProps> = (props) => {
  const { renderer, ...rest } = props;

  return (
    <Container {...rest} onPointerDown={renderer.enterAR}>
      AR
    </Container>
  );
};

export default ARButton;
