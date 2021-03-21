import type React from "react";

export interface WebGLCanvasProps
  extends React.HTMLAttributes<HTMLCanvasElement>,
    React.RefAttributes<HTMLCanvasElement> {
  /** The canvas' background color. */
  backgroundColor?: string;
}
