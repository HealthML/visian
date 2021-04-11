import React, { useLayoutEffect, useState } from "react";

import { useUpdateOnResize } from "../utils";

const modalDistance = 10;

/**
 * Returns a style object that absolutely positions a modal next to its
 * toggling button.
 */
export const useModalPosition = <T extends HTMLElement>(
  buttonElement: T | undefined | null,
  position: "left" | "right" = "right",
  updateOnResize = true,
  positionRelativeToOffsetParent = true,
): React.CSSProperties => {
  useUpdateOnResize(updateOnResize);
  const rect = buttonElement?.getBoundingClientRect();
  const offsetRect = positionRelativeToOffsetParent
    ? buttonElement?.offsetParent?.getBoundingClientRect()
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
            top: rect.top - (offsetRect?.top || 0),
            right:
              (offsetRect?.right ||
                document.body.getBoundingClientRect().width) -
              (rect.left - modalDistance),
          });
          break;

        default:
          setStyle({
            position: "absolute",
            top: rect.top - (offsetRect?.top || 0),
            left: rect.right + modalDistance - (offsetRect?.left || 0),
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
