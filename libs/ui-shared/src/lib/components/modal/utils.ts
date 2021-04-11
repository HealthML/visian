import React, { useMemo } from "react";

import { useUpdateOnResize } from "../utils";

/**
 * Returns a style object that absolutely positions a modal next to its
 * toggling button.
 */
export const useModalPosition = <T extends HTMLElement>(
  buttonElement: T | undefined | null,
  position: "left" | "right" = "right",
  updateOnResize = true,
): React.CSSProperties => {
  useUpdateOnResize(updateOnResize);
  const rect = buttonElement?.getBoundingClientRect();

  return useMemo(
    () => {
      if (!rect) return {};
      switch (position) {
        case "left":
          return {
            position: "absolute",
            top: rect.top,
            right:
              document.body.getBoundingClientRect().width - (rect.left - 20),
          };

        default:
          return { position: "absolute", top: rect.top, left: rect.right + 20 };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [position, rect?.left, rect?.right, rect?.top],
  );
};
