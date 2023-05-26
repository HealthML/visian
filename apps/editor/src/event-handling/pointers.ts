import { getOrder } from "@visian/rendering";
import {
  DeviceType,
  globalListenerTypes,
  IDispatch,
  IMeasurementTool,
  ISAMTool,
  isFirefox,
  isMac,
  isWindows,
  ITool,
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
      store.editor.activeDocument.tools.setActiveTool(
        precisionTool || "pixel-brush",
      );
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

      if (!store.editor.activeDocument) {
        return;
      }

      store.editor.activeDocument.viewport2D.setHoveredScreenCoordinates({
        x: detail.clientX,
        y: detail.clientY,
      });
    },
    forPointers: ({ context, detail, id }, { eventType }) => {
      handleDeviceSwitch(context.device);
      if (
        !store.editor.activeDocument ||
        store.editor.activeDocument.viewSettings.viewMode !== "2D"
      ) {
        store.editor.activeDocument?.viewport2D.setHoveredScreenCoordinates({
          x: detail.clientX,
          y: detail.clientY,
        });
        return;
      }

      const { activeTool } = store.editor.activeDocument.tools;
      store.editor.activeDocument.tools.setIsCursorOverFloatingUI(false);

      context.useForGesture = Boolean(
        id === "mainView" &&
          (context.button === PointerButton.MMB ||
            (activeTool?.name === "crosshair-tool" &&
              context.button === PointerButton.RMB) ||
            (isMac() ? context.metaKey : context.ctrlKey) ||
            activeTool?.name === "navigation-tool"),
      );

      if (context.useForGesture) return;

      const order = getOrder(
        store.editor.activeDocument.viewport2D.mainViewType,
      );
      const viewType =
        id === "mainView"
          ? order[0]
          : id === "upperSideView"
          ? order[1]
          : order[2];

      store.editor.activeDocument?.viewport2D.setHoveredScreenCoordinates(
        {
          x: detail.clientX,
          y: detail.clientY,
        },
        viewType,
      );

      if (!store.editor.activeDocument.tools.activeTool) {
        return;
      }

      if (!store.editor.activeDocument.activeLayer) {
        store.editor.activeDocument.setShowLayerMenu(true);
        return;
      }

      let tool: ITool<ToolName> | undefined =
        id === "mainView"
          ? store.editor.activeDocument.tools.activeTool
          : store.editor.activeDocument.tools.tools["crosshair-tool"];

      if (
        context.button === PointerButton.RMB ||
        context.button === PointerButton.Eraser
      ) {
        if (tool.name === "measurement-tool") {
          (tool as IMeasurementTool).setToDeleteMode();
        }
        if (tool.name === "sam-tool") {
          (tool as ISAMTool).setToRightClickMode();
        }

        tool = tool.altTool;
      }

      if (!tool) return;

      if (
        tool.isDrawingTool &&
        (!store.editor.activeDocument.activeLayer.isVisible ||
          !store.editor.activeDocument.activeLayer.isAnnotation)
      ) {
        store.editor.activeDocument.setShowLayerMenu(true);
        return;
      }

      const dragPoint = store.editor.activeDocument.viewport2D.hoveredDragPoint;

      switch (eventType) {
        case "start":
          store.editor.activeDocument.tools.setIsDrawing(true);
          tool.startAt(dragPoint);
          break;
        case "move":
          tool.moveTo(dragPoint);
          break;
        case "end":
          store.editor.activeDocument.tools.setIsDrawing(false);
          tool.endAt(dragPoint);
          break;
      }

      store.setIsDirty();
    },
    pointerPredicate: (pointer) => pointer.context.useForGesture as boolean,
    forGestures: ({ id, eventType, gesture }) => {
      if (!(store.editor.sliceRenderer && store.editor.activeDocument)) {
        return;
      }

      if (id !== "mainView") return;
      if (eventType === "start" || eventType === "rebase") {
        store.editor.activeDocument.tools.setIsNavigationDragged(true);
        const transformOrigin =
          store.editor.sliceRenderer.getMainViewScreenPosition(
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
          store.editor.sliceRenderer.getWebGLPosition({
            x: transform.translateX,
            y: transform.translateY,
          }),
        ),
      );
    },
  });

  return [dispatch, registerDispatch(dispatch, globalListenerTypes)];
};
