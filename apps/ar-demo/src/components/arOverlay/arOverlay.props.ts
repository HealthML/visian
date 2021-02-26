import React from "react";

import { Renderer } from "../../lib";

export interface AROverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  renderer: Renderer;
}
