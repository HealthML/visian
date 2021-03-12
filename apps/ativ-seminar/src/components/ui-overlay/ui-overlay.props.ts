import React from "react";

import type { VolumeRenderer } from "../../lib/volume-renderer";

export interface UIOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  renderer: VolumeRenderer;
}
