import {
  getWheelInteractionType,
  offsetOriginByZoomToCursorDelta,
  WheelInteractionType,
} from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";

import type { RootStore } from "../models";

export const setUpWheelHandling = (store: RootStore): IDisposer => {
  const wheelHandler = (event: WheelEvent) => {
    event.preventDefault();
    if (!store.editor.sliceRenderer) return;

    if (event.ctrlKey || event.metaKey) {
      const startZoom = store.editor.viewSettings.zoomLevel;

      const interactionType = getWheelInteractionType(event);
      switch (interactionType) {
        case WheelInteractionType.Up:
          store.editor.viewSettings.zoomIn();
          break;

        case WheelInteractionType.Down:
          store.editor.viewSettings.zoomOut();
          break;
      }

      const scaleFactor = store.editor.viewSettings.zoomLevel / startZoom;
      const transformOrigin = store.editor.sliceRenderer.getMainViewScreenPosition(
        store.editor.viewSettings.offset,
      );
      store.editor.viewSettings.setOffset(
        store.editor.sliceRenderer.getMainViewWebGLPosition(
          offsetOriginByZoomToCursorDelta(event, transformOrigin, scaleFactor),
        ),
      );
    } else {
      store.editor.viewSettings.stepSelectedSlice(-Math.sign(event.deltaY));
    }
  };

  document.addEventListener("wheel", wheelHandler, { passive: false });
  return () => {
    document.removeEventListener("wheel", wheelHandler);
  };
};
