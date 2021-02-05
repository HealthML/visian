import React from "react";
import styled from "styled-components";

import { WebGLCanvasProps } from "./webGLCanvas.props";

const StyledCanvas = styled.canvas`
  cursor: crosshair;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  &:focus {
    outline: none;
  }
`;

const WebGLCanvas = React.forwardRef<HTMLCanvasElement, WebGLCanvasProps>(
  (props, ref) => {
    return <StyledCanvas {...props} width={1} height={1} ref={ref} />;
  },
);

export default WebGLCanvas;
