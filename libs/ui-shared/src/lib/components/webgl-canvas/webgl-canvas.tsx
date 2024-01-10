import React from "react";
import styled from "styled-components";

import { WebGLCanvasProps } from "./webgl-canvas.props";
import { coverMixin } from "../mixins";

export const WebGLCanvas: React.FC<WebGLCanvasProps> = styled.canvas.attrs<{
  backgroundColor?: string;
}>((props) => ({
  height: 1,
  width: 1,

  style: {
    background: props.backgroundColor,
  },
}))<{ backgroundValue: number }>`
  ${coverMixin}
  cursor: crosshair;

  &:focus {
    outline: none;
  }
`;

export default WebGLCanvas;
