import React from "react";

import {
  RelativePositionConfig,
  RelativePositionStyleConfig,
  useRelativePosition,
} from "../utils";

export type ModalPosition = "left" | "right" | "top" | "bottom";
export type ModalPositionConfig = RelativePositionConfig<ModalPosition>;

const defaultModalDistance = 10;

const computeStyle = ({
  position = "right",
  distance = defaultModalDistance,
  rect,
  offsetRect,
}: RelativePositionStyleConfig<ModalPosition>): React.CSSProperties => {
  const shouldPositionToBottom = rect.top / window.innerHeight < 2 / 3;

  switch (position) {
    case "left":
      return {
        bottom: shouldPositionToBottom
          ? undefined
          : (offsetRect?.bottom ||
              document.body.getBoundingClientRect().height) - rect.bottom,
        position: "absolute",
        top: shouldPositionToBottom
          ? rect.top - (offsetRect?.top || 0)
          : undefined,
        right:
          (offsetRect?.right || document.body.getBoundingClientRect().width) -
          (rect.left - distance),
      };

    case "right":
      return {
        bottom: shouldPositionToBottom
          ? undefined
          : (offsetRect?.bottom ||
              document.body.getBoundingClientRect().height) - rect.bottom,
        position: "absolute",
        top: shouldPositionToBottom
          ? rect.top - (offsetRect?.top || 0)
          : undefined,
        left: rect.right + distance - (offsetRect?.left || 0),
      };
    case "top":
      return {
        position: "absolute",
        top: rect.top - (offsetRect?.top || 0) - distance,
        left: rect.right - (offsetRect?.left || 0) - rect.width / 2,
        transform: "translateX(-50%) translateY(-100%)",
      };
    default:
      return {
        position: "absolute",
        top: rect.bottom - (offsetRect?.bottom || 0) + distance,
        left: rect.right - (offsetRect?.left || 0) - rect.width / 2,
        transform: "translateX(-50%)",
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
