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
import { IDisposer } from "@visian/utils";

import { RootStore, ToolType } from "../models";

export const setUpPointerHandling = (
  store: RootStore,
): [IDispatch, IDisposer] => {
  /** The tool used by the mouse or pen. */
  let precisionTool: ToolType | undefined;

  let previousDevice: DeviceType | undefined;

  const handleDeviceSwitch = (device: DeviceType) => {
    if (previousDevice === device) return;

    // Sadly, pen input is detected as `touch` pointer events in Firefox on
    // Windows. See https://bugzilla.mozilla.org/show_bug.cgi?id=1487509#c5
    if (isFirefox() && isWindows()) return;

    if (device === "touch") {
      precisionTool = store.editor.tools.activeTool;
      store.editor.tools.setActiveTool(ToolType.Navigate);
    } else if (
      previousDevice === "touch" &&
      store.editor.tools.activeTool === ToolType.Navigate
    ) {
      // We intentionally replace the navigation tool by the brush tool here
      // using the `||`
      store.editor.tools.setActiveTool(precisionTool || ToolType.Brush);
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

      store.editor.tools.handleEvent({
        x: detail.clientX,
        y: detail.clientY,
      });
    },
    forPointers: ({ context, detail, id }, { eventType }) => {
      handleDeviceSwitch(context.device);
      const { activeTool } = store.editor.tools;
      store?.editor.tools.setIsCursorOverFloatingUI(false);

      context.useForGesture = Boolean(
        id === "mainView" &&
          (context.button === PointerButton.MMB ||
            (activeTool === ToolType.Crosshair &&
              context.button === PointerButton.RMB) ||
            context.ctrlKey ||
            activeTool === ToolType.Navigate),
      );

      if (!context.useForGesture) {
        if (activeTool === ToolType.Crosshair || id !== "mainView") {
          // Crosshairs are only active if side views are shown.
          if (!store.editor.viewSettings.showSideViews) return;
          store.editor.viewSettings.moveCrosshair(
            {
              x: detail.clientX,
              y: detail.clientY,
            },
            id,
          );
        } else if (id === "mainView") {
          store.editor.tools.handleEvent(
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
      if (!store.editor.sliceRenderer) return;

      if (id !== "mainView") return;
      if (eventType === "start" || eventType === "rebase") {
        store.editor.tools.setIsNavigationDragged(true);
        const transformOrigin = store.editor.sliceRenderer.getMainViewScreenPosition(
          store.editor.viewSettings.offset,
        );
        gesture.setStartTransform({
          translateX: transformOrigin.x,
          translateY: transformOrigin.y,
          scale: store.editor.viewSettings.zoomLevel,
        });
      } else if (eventType === "end") {
        store.editor.tools.setIsNavigationDragged(false);
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
