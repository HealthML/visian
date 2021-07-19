import React from "react";

import { Renderer } from "../../lib";

export interface UIOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  renderer: Renderer;
}
