import {
  DeviceType,
  EventLike,
  globalListenerTypes,
  IDispatch,
  isFirefox,
  isWindows,
  Pointer,
  PointerButton,
  PointerEventData,
  registerDispatch,
  transformGesturePreset,
  TransformGestureWrapper,
} from "@visian/ui-shared";
import { IDisposer } from "@visian/utils";
import throttle from "lodash.throttle";

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

  const handlePointer = throttle(
    (
      { context, detail, id }: Pointer<string | undefined>,
      { eventType }: PointerEventData<string, EventLike<string>>,
      isHovering?: boolean,
    ) => {
      if (isHovering) {
        store.editor.tools.handleEvent({
          x: detail.clientX,
          y: detail.clientY,
        });
        return;
      }

      const activeTool = store.editor.tools.activeTool;
      if (activeTool === ToolType.Crosshair || id !== "mainView") {
        // Crosshairs are only active if side views are shown.
        if (!store.editor.viewSettings.showSideViews) return;
        store.editor.viewSettings.moveCrosshair(
          {
            x: detail.clientX,
            y: detail.clientY,
          },
          id as string,
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
    },
    1000 / 60,
    { leading: true, trailing: true },
  );

  const handleTransformGesture = ({
    gesture,
  }: TransformGestureWrapper<string>) => {
    if (!store.editor.sliceRenderer) return;
    const transform = gesture.getTransformed();
    store.editor.viewSettings.setZoomLevel(transform.scale);
    store.editor.viewSettings.setOffset(
      store.editor.sliceRenderer.getMainViewWebGLPosition({
        x: transform.translateX,
        y: transform.translateY,
      }),
    );
  };

  const dispatch = transformGesturePreset({
    forUnidentifiedPointers: (pointer, data) => {
      if (pointer.detail.buttons) return;
      if (data.eventType === "end") {
        previousDevice = pointer.context.device;
        return;
      }
      handleDeviceSwitch(pointer.context.device);

      handlePointer(pointer, data, true);
    },
    forPointers: (pointer, data) => {
      const { context } = pointer;
      handleDeviceSwitch(context.device);
      const activeTool = store.editor.tools.activeTool;
      store?.editor.tools.setIsCursorOverFloatingUI(false);

      context.useForGesture = Boolean(
        pointer.id === "mainView" &&
          (context.button === PointerButton.MMB ||
            (activeTool === ToolType.Crosshair &&
              context.button === PointerButton.RMB) ||
            context.ctrlKey ||
            activeTool === ToolType.Navigate),
      );

      if (context.useForGesture) return;
      handlePointer(pointer, data, false);
    },
    pointerPredicate: (pointer) => pointer.context.useForGesture as boolean,
    forGestures: (transformGesture: TransformGestureWrapper<string>) => {
      if (!store.editor.sliceRenderer) return;
      if (transformGesture.id !== "mainView") return;

      const { eventType } = transformGesture;
      if (eventType === "start" || eventType === "rebase") {
        store.editor.tools.setIsNavigationDragged(true);
        const transformOrigin = store.editor.sliceRenderer.getMainViewScreenPosition(
          store.editor.viewSettings.offset,
        );
        transformGesture.gesture.setStartTransform({
          translateX: transformOrigin.x,
          translateY: transformOrigin.y,
          scale: store.editor.viewSettings.zoomLevel,
        });
      } else if (eventType === "end") {
        store.editor.tools.setIsNavigationDragged(false);
      }

      handleTransformGesture(transformGesture);
    },
  });

  return [dispatch, registerDispatch(dispatch, globalListenerTypes)];
};
