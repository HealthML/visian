import {
  getWheelInteractionType,
  offsetOriginByZoomToCursorDelta,
  WheelInteractionType,
} from "@visian/ui-shared";
import { IDisposer, Vector } from "@visian/utils";

import type { RootStore } from "../models";

export const setUpWheelHandling = (store: RootStore): IDisposer => {
  const wheelHandler = (event: WheelEvent) => {
    event.preventDefault();
    if (
      !(
        store.editor.sliceRenderer &&
        store.editor.volumeRenderer &&
        store.editor.activeDocument
      )
    ) {
      return;
    }

    if (store.editor.activeDocument?.viewSettings.viewMode === "3D") {
      if (
        store.editor.activeDocument?.tools.activeTool?.name === "plane-tool"
      ) {
        const interactionType = getWheelInteractionType(event);
        switch (interactionType) {
          case WheelInteractionType.Up:
            store.editor.activeDocument.viewport3D.decreaseClippingPlaneDistance();
            break;

          case WheelInteractionType.Down:
            store.editor.activeDocument.viewport3D.increaseClippingPlaneDistance();
            break;
        }
      }

      return;
    }

    if (event.ctrlKey || event.metaKey) {
      const startZoom = store.editor.activeDocument.viewport2D.zoomLevel;

      const interactionType = getWheelInteractionType(event);
      switch (interactionType) {
        case WheelInteractionType.Up:
          store.editor.activeDocument.viewport2D.zoomIn();
          break;

        case WheelInteractionType.Down:
          store.editor.activeDocument.viewport2D.zoomOut();
          break;
      }

      const scaleFactor =
        store.editor.activeDocument.viewport2D.zoomLevel / startZoom;
      const transformOrigin = store.editor.sliceRenderer.getMainViewScreenPosition(
        store.editor.activeDocument.viewport2D.offset,
      );
      store.editor.activeDocument.viewport2D.setOffset(
        Vector.fromObject(
          store.editor.sliceRenderer.getWebGLPosition(
            offsetOriginByZoomToCursorDelta(
              event,
              transformOrigin,
              scaleFactor,
            ),
          ),
        ),
      );
    } else if (event.altKey) {
      const interactionType = getWheelInteractionType(event);
      switch (interactionType) {
        case WheelInteractionType.Up:
          store.editor.activeDocument.tools.decrementBrushSize();
          break;

        case WheelInteractionType.Down:
          store.editor.activeDocument.tools.incrementBrushSize();
          break;
      }
    } else {
      if (store.editor.activeDocument.tools?.isDrawing) return;
      store.editor.activeDocument.viewport2D.stepSelectedSlice(
        undefined,
        -Math.sign(event.deltaY),
      );
    }
  };

  document.addEventListener("wheel", wheelHandler, { passive: false });
  return () => {
    document.removeEventListener("wheel", wheelHandler);
  };
};
