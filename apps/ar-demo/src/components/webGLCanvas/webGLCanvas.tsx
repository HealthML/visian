import React from "react";
import styled, { css } from "styled-components";

import { WebGLCanvasProps } from "./webGLCanvas.props";

const coverMixin = css`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

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

const WebGLCanvas = React.forwardRef<HTMLCanvasElement, WebGLCanvasProps>(
  (props, ref) => (
    <StyledDiv>
      <StyledCanvas {...props} width={1} height={1} ref={ref} />
    </StyledDiv>
  ),
);

export default WebGLCanvas;
