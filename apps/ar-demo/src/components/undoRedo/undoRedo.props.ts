import React from "react";

import { Renderer } from "../../lib";

export interface UndoRedoProps extends React.HTMLAttributes<HTMLDivElement> {
  renderer: Renderer;
}
