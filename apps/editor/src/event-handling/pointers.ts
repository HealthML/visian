import {
  globalListenerTypes,
  IDispatch,
  registerDispatch,
  transformGesturePreset,
} from "@visian/ui-shared";
import { IDisposer } from "@visian/util";

import type { RootStore } from "../models";

export const setUpPointerHandling = (
  store: RootStore,
): [IDispatch, IDisposer] => {
  const dispatch = transformGesturePreset(({ id, eventType, gesture }) => {
    if (!store.editor.sliceRenderer) return;

    if (id !== "mainCanvas") return;
    if (eventType === "start" || eventType === "rebase") {
      const transformOrigin = store.editor.sliceRenderer.getMainViewScreenPosition(
        store.editor.viewSettings.offset,
      );
      gesture.setStartTransform({
        translateX: transformOrigin.x,
        translateY: transformOrigin.y,
        scale: store.editor.viewSettings.zoomLevel,
      });
    }

    const transform = gesture.getTransformed();
    store.editor.viewSettings.setZoomLevel(transform.scale);
    store.editor.viewSettings.setOffset(
      store.editor.sliceRenderer.getMainViewWebGLPosition({
        x: transform.translateX,
        y: transform.translateY,
      }),
    );
  });

  return [dispatch, registerDispatch(dispatch, globalListenerTypes)];
};
