import React from "react";

import { Renderer } from "../../lib";

export interface ToolBarProps extends React.HTMLAttributes<HTMLDivElement> {
  renderer: Renderer;

  showSettings?: boolean;
  toggleSettings?: () => void;
}
