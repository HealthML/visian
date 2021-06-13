import { IDisposer, ViewType } from "@visian/utils";
import hotkeys from "hotkeys-js";

import { skipSlices } from "../constants";

import { ImageLayer, RootStore } from "../models";

export const setUpHotKeys = (store: RootStore): IDisposer => {
  // Tool Selection
  hotkeys("h", (event) => {
    event.preventDefault();
    store.editor.activeDocument?.tools.setActiveTool("navigation-tool");
  });
  hotkeys("c", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;
    if (!store.editor.activeDocument?.has3DLayers) return;

    store.editor.activeDocument?.tools.setActiveTool("crosshair-tool");
  });
  hotkeys("b", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.tools.setActiveTool("pixel-brush");
  });
  hotkeys("s", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.tools.setActiveTool("smart-brush");
  });
  hotkeys("e", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.tools.setActiveTool("pixel-eraser");
  });
  hotkeys("o", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.tools.setActiveTool("outline-tool");
  });
  hotkeys("shift+f,f", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "3D") return;

    const activeTool = store.editor.activeDocument?.tools.activeTool?.name;
    store.editor.activeDocument?.tools.setActiveTool(
      activeTool === "fly-tool" ? "navigation-tool" : "fly-tool",
    );
  });

  // Tools
  hotkeys("del,backspace", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.tools.setActiveTool("clear-slice");
  });
  hotkeys("ctrl+del,ctrl+backspace", (event) => {
    event.preventDefault();
    store.editor.activeDocument?.tools.setActiveTool("clear-image");
  });

  // Brush Size
  hotkeys("*", (event) => {
    // "+" doesn't currently work with hotkeys-js (https://github.com/jaywcjlove/hotkeys/issues/270)
    if (event.key === "+" && !event.ctrlKey) {
      store.editor.activeDocument?.tools.incrementBrushSize();
    }
  });
  hotkeys("-", () => {
    store.editor.activeDocument?.tools.decrementBrushSize();
  });

  // Undo/Redo
  hotkeys("ctrl+z", (event) => {
    event.preventDefault();
    store.editor.activeDocument?.history.undo();
  });
  hotkeys("ctrl+shift+z,ctrl+y", (event) => {
    event.preventDefault();
    store.editor.activeDocument?.history.redo();
  });

  // Layer Controls
  hotkeys("m", () => {
    store.editor.activeDocument?.activeLayer?.setIsVisible(
      !store.editor.activeDocument.activeLayer.isVisible,
    );
  });

  // View Types
  hotkeys("1", () => {
    store.editor.activeDocument?.viewport2D.setMainViewType(
      ViewType.Transverse,
    );
    store.editor.activeDocument?.viewSettings.setViewMode("2D");
  });
  hotkeys("2", () => {
    store.editor.activeDocument?.viewport2D.setMainViewType(ViewType.Sagittal);
    store.editor.activeDocument?.viewSettings.setViewMode("2D");
  });
  hotkeys("3", () => {
    store.editor.activeDocument?.viewport2D.setMainViewType(ViewType.Coronal);
    store.editor.activeDocument?.viewSettings.setViewMode("2D");
  });
  hotkeys("4", () => {
    store.editor.activeDocument?.viewSettings.setViewMode("3D");
  });
  hotkeys("0", () => {
    store.editor.activeDocument?.viewport2D.toggleSideViews();
  });

  // Slice Navigation
  hotkeys("up", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.viewport2D.stepSelectedSlice(undefined, 1);
  });
  hotkeys("shift+up", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.viewport2D.stepSelectedSlice(
      undefined,
      skipSlices,
    );
  });
  hotkeys("down", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.viewport2D.stepSelectedSlice(undefined, -1);
  });
  hotkeys("shift+down", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.viewport2D.stepSelectedSlice(
      undefined,
      -skipSlices,
    );
  });
  hotkeys("alt+0", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.viewSettings.setSelectedVoxel();
  });

  // Zoom
  hotkeys("*", (event) => {
    // "+" doesn't currently work with hotkeys-js (https://github.com/jaywcjlove/hotkeys/issues/270)
    if (event.key === "+" && event.ctrlKey) {
      event.preventDefault();
      if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

      store.editor.activeDocument?.viewport2D.zoomIn();
    }
  });
  hotkeys("ctrl+-", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.viewport2D.zoomOut();
  });
  hotkeys("ctrl+0", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.viewport2D.setZoomLevel();
    store.editor.activeDocument?.viewport2D.setOffset();
  });

  // Save & Export
  hotkeys("ctrl+s", (event) => {
    event.preventDefault();
    store.editor.activeDocument?.save();
  });
  hotkeys("ctrl+e", (event) => {
    event.preventDefault();
    (store.editor.activeDocument?.activeLayer as ImageLayer)?.quickExport?.();
  });
  hotkeys("ctrl+shift+e", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    (store.editor.activeDocument
      ?.activeLayer as ImageLayer)?.quickExportSlice?.();
  });

  return () => hotkeys.unbind();
};
