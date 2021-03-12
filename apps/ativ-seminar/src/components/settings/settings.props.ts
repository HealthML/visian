import React from "react";

import type { VolumeRenderer } from "../../lib/volume-renderer";

export interface SettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  renderer: VolumeRenderer;
}
