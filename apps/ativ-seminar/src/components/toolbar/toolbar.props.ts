import React from "react";

import type { VolumeRenderer } from "../../lib/volume-renderer";

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  renderer: VolumeRenderer;
}
