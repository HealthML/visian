import React from "react";

import {
  RelativePositionConfig,
  RelativePositionStyleConfig,
  useRelativePosition,
} from "../utils";
import { DropDownOptionsPosition } from "./drop-down.props";

const computeStyle = ({
  position = "bottom",
  rect,
  offsetRect,
}: RelativePositionStyleConfig<DropDownOptionsPosition>): React.CSSProperties => {
  switch (position) {
    case "bottom":
      return {
        position: "absolute",
        top: rect.top - (offsetRect?.top || 0),
        left: rect.left - (offsetRect?.left || 0),
        right:
          (offsetRect?.right || document.body.getBoundingClientRect().width) -
          rect.right,
      };

    case "top":
      return {
        position: "absolute",
        bottom:
          offsetRect?.bottom ||
          document.body.getBoundingClientRect().height - rect.bottom,
        left: rect.left - (offsetRect?.left || 0),
        right:
          (offsetRect?.right || document.body.getBoundingClientRect().width) -
          rect.right,
      };
  }
};

/**
 * Returns a style object that absolutely positions the options of a drop down
 * menu.
 */
export const useOptionsPosition = (
  config: RelativePositionConfig<DropDownOptionsPosition>,
): React.CSSProperties => useRelativePosition(computeStyle, config);
