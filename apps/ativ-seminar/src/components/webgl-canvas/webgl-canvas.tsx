import { coverMixin } from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";

import { WebGLCanvasProps } from "./webgl-canvas.props";

const StyledCanvas = styled.canvas`
  ${coverMixin}
  cursor: crosshair;

  &:focus {
    outline: none;
  }
`;

const StyledDiv = styled.div`
  ${coverMixin}
`;

export const WebGLCanvas = React.forwardRef<
  HTMLCanvasElement,
  WebGLCanvasProps
>((props, ref) => {
  return (
    <StyledDiv>
      <StyledCanvas {...props} width={1} height={1} ref={ref} />
    </StyledDiv>
  );
});

export default WebGLCanvas;
