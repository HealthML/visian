import { coverMixin } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";

import { WebGLCanvasProps } from "./webgl-canvas.props";

const StyledCanvas = styled.canvas.attrs<{ backgroundValue: number }>(
  (props) => ({
    style: {
      background: `rgb(${props.backgroundValue * 255},${
        props.backgroundValue * 255
      },${props.backgroundValue * 255})`,
    },
  }),
)<{ backgroundValue: number }>`
  ${coverMixin}
  cursor: crosshair;

  &:focus {
    outline: none;
  }
`;

const StyledDiv = styled.div`
  ${coverMixin}
`;

export const WebGLCanvas = observer<WebGLCanvasProps, HTMLCanvasElement>(
  ({ renderer, ...props }, ref) => (
    <StyledDiv>
      <StyledCanvas
        {...props}
        backgroundValue={renderer ? renderer.backgroundValue : 0}
        width={1}
        height={1}
        ref={ref}
      />
    </StyledDiv>
  ),
  { forwardRef: true },
);

export default WebGLCanvas;
