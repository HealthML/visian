import React from "react";

import { Renderer } from "../../lib";

export interface MagicAIButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  renderer: Renderer;
}
