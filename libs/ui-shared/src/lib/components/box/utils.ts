import { useEffect, useRef } from "react";
import { useTheme } from "styled-components";

import { Theme } from "../../theme";

/**
 * Returns a ref to an element that is part of the modal root (if there is one)
 * to render to using a ReactDOM portal.
 */
export const useModalRoot = () => {
  const modalRootId = (useTheme() as Theme)?.modalRootId;
  const modalRoot = document.getElementById(modalRootId);

  const modalRootRef = useRef<HTMLElement>();
  useEffect(() => {
    if (modalRoot) {
      modalRootRef.current = document.createElement("div");
      modalRoot.appendChild(modalRootRef.current);

      return () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        modalRoot.removeChild(modalRootRef.current!);
        modalRootRef.current = undefined;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalRootId, Boolean(modalRoot)]);

  return modalRootRef;
};
