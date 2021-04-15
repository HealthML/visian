import React, { useLayoutEffect, useState } from "react";

import { useUpdateOnResize } from "../utils";

export type TooltipPosition = "left" | "right" | "bottom";

const tooltipDistance = 10;

/**
 * Returns a style object that absolutely positions a tooltip next to the
 * element it refers to.
 */
export const useTooltipPosition = <T extends HTMLElement>(
  element: T | undefined | null,
  position: TooltipPosition = "right",
  updateOnResize = true,
  positionRelativeToOffsetParent = false,
): React.CSSProperties => {
  useUpdateOnResize(updateOnResize);
  const rect = element?.getBoundingClientRect();
  const offsetRect = positionRelativeToOffsetParent
    ? element?.offsetParent?.getBoundingClientRect()
    : undefined;

  const [style, setStyle] = useState<React.CSSProperties>({});
  useLayoutEffect(
    () => {
      if (!rect) {
        setStyle({});
        return;
      }

      switch (position) {
        case "left":
          setStyle({
            position: "absolute",
            top: rect.top + rect.height / 2 - (offsetRect?.top || 0),
            right:
              (offsetRect?.right ||
                document.body.getBoundingClientRect().width) -
              (rect.left - tooltipDistance),
            transform: "translateY(-50%)",
          });
          break;

        case "bottom":
          setStyle({
            position: "absolute",
            top: rect.bottom + tooltipDistance - (offsetRect?.top || 0),
            left: rect.left + rect.width / 2 - (offsetRect?.left || 0),
            transform: "translateX(-50%)",
          });
          break;

        default:
          setStyle({
            position: "absolute",
            top: rect.top + rect.height / 2 - (offsetRect?.top || 0),
            left: rect.right + tooltipDistance - (offsetRect?.left || 0),
            transform: "translateY(-50%)",
          });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      position,
      rect?.left,
      rect?.right,
      rect?.top,
      offsetRect?.left,
      offsetRect?.right,
      offsetRect?.top,
    ],
  );

  return style;
};
