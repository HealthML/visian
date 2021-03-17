import React, { RefAttributes } from "react";

export interface WebGLCanvasProps
  extends React.HTMLAttributes<HTMLCanvasElement>,
    RefAttributes<HTMLCanvasElement> {
  /** The canvas' background color. */
  backgroundColor?: string;
}
