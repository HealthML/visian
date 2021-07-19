import { Box } from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";

import { CrosshairProps } from ".";
import { CrosshairPointer } from "../icons";

const Container = styled(Box)`
  position: absolute;
  bottom: calc(50% - 20px);
  left: calc(50% - 20px);
  right: calc(50% - 20px);
  top: calc(50% - 20px);
  justify-content: center;
  align-items: center;
  display: flex;
`;

const StyledIcon = styled(CrosshairPointer)`
  fill: #000000;
  stroke: #ffffff;
  stroke-width: 4pt;
`;

const Crosshair: React.FC<CrosshairProps> = (props) => (
  <Container {...props}>
    <StyledIcon />
  </Container>
);

export default Crosshair;
