import React from "react";

import { Renderer } from "../../lib";

export interface ARButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  renderer: Renderer;
}
