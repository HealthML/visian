import React from "react";

import {
  RelativePositionConfig,
  RelativePositionStyleConfig,
  useRelativePosition,
} from "../utils";

export type TooltipPosition = "left" | "right" | "bottom";
export type TooltipPositionConfig = RelativePositionConfig<TooltipPosition>;

const defaultTooltipDistance = 10;

const computeStyle = ({
  position = "right",
  distance = defaultTooltipDistance,
  rect,
  offsetRect,
}: RelativePositionStyleConfig<TooltipPosition>): React.CSSProperties => {
  switch (position) {
    case "left":
      return {
        position: "absolute",
        top: rect.top + rect.height / 2 - (offsetRect?.top || 0),
        right:
          (offsetRect?.right || document.body.getBoundingClientRect().width) -
          (rect.left - distance),
        transform: "translateY(-50%)",
      };

    case "bottom":
      return {
        position: "absolute",
        top: rect.bottom + distance - (offsetRect?.top || 0),
        left: rect.left + rect.width / 2 - (offsetRect?.left || 0),
        transform: "translateX(-50%)",
      };

    default:
      return {
        position: "absolute",
        top: rect.top + rect.height / 2 - (offsetRect?.top || 0),
        left: rect.right + distance - (offsetRect?.left || 0),
        transform: "translateY(-50%)",
      };
  }
};

/**
 * Returns a style object that absolutely positions a tooltip next to the
 * element it refers to.
 */
export const useTooltipPosition = (
  config: TooltipPositionConfig,
): React.CSSProperties => useRelativePosition(computeStyle, config);
