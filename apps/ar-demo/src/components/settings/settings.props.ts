import React from "react";

import { Renderer } from "../../lib";

export interface SettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  renderer: Renderer;
}
