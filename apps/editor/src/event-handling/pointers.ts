import {
  DeviceType,
  globalListenerTypes,
  IDispatch,
  isFirefox,
  isWindows,
  PointerButton,
  registerDispatch,
  transformGesturePreset,
} from "@visian/ui-shared";
import { IDisposer, Vector } from "@visian/utils";

import { RootStore, ToolName } from "../models";

export const setUpPointerHandling = (
  store: RootStore,
): [IDispatch, IDisposer] => {
  /** The tool used by the mouse or pen. */
  let precisionTool: ToolName | undefined;

  let previousDevice: DeviceType | undefined;

  const handleDeviceSwitch = (device: DeviceType) => {
    if (previousDevice === device) return;

    // Sadly, pen input is detected as `touch` pointer events in Firefox on
    // Windows. See https://bugzilla.mozilla.org/show_bug.cgi?id=1487509#c5
    if (isFirefox() && isWindows()) return;

    if (!store.editor.activeDocument) return;
    if (device === "touch") {
      precisionTool = store.editor.activeDocument.tools.activeTool?.name;
      store.editor.activeDocument.tools.setActiveTool("navigation-tool");
    } else if (
      previousDevice === "touch" &&
      store.editor.activeDocument.tools.activeTool?.name === "navigation-tool"
    ) {
      // We intentionally replace the navigation tool by the brush tool here
      // using the `||`
      store.editor.activeDocument.tools.setActiveTool(precisionTool || "brush");
    }

    previousDevice = device;
  };

  const dispatch = transformGesturePreset({
    forUnidentifiedPointers: ({ context, detail }, { eventType }) => {
      if (detail.buttons) return;
      if (eventType === "end") {
        previousDevice = context.device;
        return;
      }
      handleDeviceSwitch(context.device);

      if (!store.editor.activeDocument) return;
      // TODO
      store.editor.activeDocument.tools.handleEvent({
        x: detail.clientX,
        y: detail.clientY,
      });
    },
    forPointers: ({ context, detail, id }, { eventType }) => {
      handleDeviceSwitch(context.device);
      if (!store.editor.activeDocument) return;

      const { activeTool } = store.editor.activeDocument.tools;
      store.editor.activeDocument.tools.setIsCursorOverFloatingUI(false);

      context.useForGesture = Boolean(
        id === "mainView" &&
          (context.button === PointerButton.MMB ||
            (activeTool?.name === "crosshair-tool" &&
              context.button === PointerButton.RMB) ||
            context.ctrlKey ||
            activeTool?.name === "navigation-tool"),
      );

      if (!context.useForGesture) {
        if (activeTool?.name === "crosshair-tool" || id !== "mainView") {
          // Crosshairs are only active if side views are shown.
          if (!store.editor.activeDocument.viewport2D.showSideViews) return;
          // TODO
          store.editor.activeDocument?.viewport2D.moveCrosshair(
            {
              x: detail.clientX,
              y: detail.clientY,
            },
            id,
          );
        } else if (id === "mainView") {
          // TODO
          store.editor.activeDocument.tools.handleEvent(
            {
              x: detail.clientX,
              y: detail.clientY,
            },
            eventType,
            context.button === PointerButton.RMB ||
              context.button === PointerButton.Eraser,
          );
        }
      }
    },
    pointerPredicate: (pointer) => pointer.context.useForGesture as boolean,
    forGestures: ({ id, eventType, gesture }) => {
      if (!(store.editor.sliceRenderer && store.editor.activeDocument)) {
        return;
      }

      if (id !== "mainView") return;
      if (eventType === "start" || eventType === "rebase") {
        store.editor.activeDocument.tools.setIsNavigationDragged(true);
        const transformOrigin = store.editor.sliceRenderer.getMainViewScreenPosition(
          store.editor.activeDocument.viewport2D.offset,
        );
        gesture.setStartTransform({
          translateX: transformOrigin.x,
          translateY: transformOrigin.y,
          scale: store.editor.activeDocument.viewport2D.zoomLevel,
        });
      } else if (eventType === "end") {
        store.editor.activeDocument.tools.setIsNavigationDragged(false);
      }

      const transform = gesture.getTransformed();
      store.editor.activeDocument.viewport2D.setZoomLevel(transform.scale);
      store.editor.activeDocument.viewport2D.setOffset(
        Vector.fromObject(
          store.editor.sliceRenderer.getMainViewWebGLPosition({
            x: transform.translateX,
            y: transform.translateY,
          }),
        ),
      );
    },
  });

  return [dispatch, registerDispatch(dispatch, globalListenerTypes)];
};
