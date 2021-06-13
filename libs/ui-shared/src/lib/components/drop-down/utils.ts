import React from "react";

import {
  RelativePositionConfig,
  RelativePositionStyleConfig,
  useRelativePosition,
} from "../utils";

const computeStyle = ({
  rect,
  offsetRect,
}: RelativePositionStyleConfig): React.CSSProperties => ({
  position: "absolute",
  top: rect.top - (offsetRect?.top || 0),
  left: rect.left - (offsetRect?.left || 0),
  right:
    (offsetRect?.right || document.body.getBoundingClientRect().width) -
    rect.right,
});

/**
 * Returns a style object that absolutely positions the options of a drop down
 * menu.
 */
export const useOptionsPosition = (
  config: RelativePositionConfig,
): React.CSSProperties => useRelativePosition(computeStyle, config);
