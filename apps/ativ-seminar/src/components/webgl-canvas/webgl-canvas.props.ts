import React from "react";

import type { VolumeRenderer } from "../../lib/volume-renderer";

export interface WebGLCanvasProps
  extends React.HTMLAttributes<HTMLCanvasElement> {
  renderer?: VolumeRenderer;
}
