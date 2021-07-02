import React from "react";

import {
  RelativePositionConfig,
  RelativePositionStyleConfig,
  useRelativePosition,
} from "../utils";

export type ContextMenuPositionConfig = RelativePositionConfig<void>;

const defaultContextMenuDistance = 10;

const computeStyle = ({
  distance = defaultContextMenuDistance,
  rect,
  offsetRect,
}: RelativePositionStyleConfig<void>): React.CSSProperties => {
  const shouldPositionToBottom = rect.top / window.innerHeight < 2 / 3;
  const shouldPositionToRight = rect.left / window.innerWidth < 2 / 3;

  return {
    position: "absolute",
    left: shouldPositionToRight
      ? rect.right + distance - (offsetRect?.left || 0)
      : undefined,
    right: shouldPositionToRight
      ? undefined
      : (offsetRect?.right || document.body.getBoundingClientRect().width) -
        (rect.left - distance),
    top: shouldPositionToBottom ? rect.top - (offsetRect?.top || 0) : undefined,
    bottom: shouldPositionToBottom
      ? undefined
      : (offsetRect?.bottom || document.body.getBoundingClientRect().height) -
        rect.bottom,
  };
};

/**
 * Returns a style object that absolutely positions a modal next to the
 * element it refers to.
 */
export const useContextMenuPosition = (
  config: ContextMenuPositionConfig,
): React.CSSProperties => useRelativePosition(computeStyle, config);
