import React from "react";

import {
  RelativePositionConfig,
  RelativePositionStyleConfig,
  useRelativePosition,
} from "../utils";

export type ModalPosition = "left" | "right";
export type ModalPositionConfig = RelativePositionConfig<ModalPosition>;

const defaultModalDistance = 10;

const computeStyle = ({
  position = "right",
  distance = defaultModalDistance,
  rect,
  offsetRect,
}: RelativePositionStyleConfig<ModalPosition>): React.CSSProperties => {
  switch (position) {
    case "left":
      return {
        position: "absolute",
        top: rect.top - (offsetRect?.top || 0),
        right:
          (offsetRect?.right || document.body.getBoundingClientRect().width) -
          (rect.left - distance),
      };

    default:
      return {
        position: "absolute",
        top: rect.top - (offsetRect?.top || 0),
        left: rect.right + distance - (offsetRect?.left || 0),
      };
  }
};

/**
 * Returns a style object that absolutely positions a modal next to the
 * element it refers to.
 */
export const useModalPosition = (
  config: ModalPositionConfig,
): React.CSSProperties => useRelativePosition(computeStyle, config);
