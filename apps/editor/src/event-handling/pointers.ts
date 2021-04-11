import {
  globalListenerTypes,
  IDispatch,
  PointerButton,
  registerDispatch,
  transformGesturePreset,
} from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";

import { RootStore, ToolType } from "../models";

export const setUpPointerHandling = (
  store: RootStore,
): [IDispatch, IDisposer] => {
  const dispatch = transformGesturePreset({
    forUnidentifiedPointers: ({ detail }) => {
      if (detail.buttons) return;

      store.editor.tools.handleEvent({
        x: detail.clientX,
        y: detail.clientY,
      });
    },
    forPointers: ({ context, detail, id }, { eventType }) => {
      const activeTool = store.editor.tools.activeTool;

      context.useForGesture = Boolean(
        id === "mainView" &&
          (context.device === "touch" ||
            context.button === PointerButton.MMB ||
            (activeTool === ToolType.Crosshair &&
              context.button === PointerButton.RMB) ||
            context.ctrlKey ||
            activeTool === ToolType.Navigate),
      );

      if (!context.useForGesture) {
        if (activeTool === ToolType.Crosshair || id !== "mainView") {
          // Crosshairs are only active if side views are shown.
          if (store.editor.viewSettings.shouldShowSideViews) {
            store.editor.viewSettings.moveCrosshair(
              {
                x: detail.clientX,
                y: detail.clientY,
              },
              id,
            );
          }
        } else if (id === "mainView") {
          store.editor.tools.handleEvent(
            {
              x: detail.clientX,
              y: detail.clientY,
            },
            eventType,
            context.button === PointerButton.RMB,
          );
        }
      }
    },
    pointerPredicate: (pointer) => pointer.context.useForGesture as boolean,
    forGestures: ({ id, eventType, gesture }) => {
      if (!store.editor.sliceRenderer) return;

      if (id !== "mainView") return;
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
    },
  });

  return [dispatch, registerDispatch(dispatch, globalListenerTypes)];
};
