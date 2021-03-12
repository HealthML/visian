import React from "react";

import type { VolumeRenderer } from "../../lib/volume-renderer";

export interface ToolBarProps extends React.HTMLAttributes<HTMLDivElement> {
  renderer: VolumeRenderer;

  showSettings?: boolean;
  toggleSettings?: () => void;
}
