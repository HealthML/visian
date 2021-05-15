import { IDisposer, ViewType } from "@visian/utils";
import hotkeys from "hotkeys-js";

import { skipSlices } from "../constants";

import { RootStore, ToolType } from "../models";

export const setUpHotKeys = (store: RootStore): IDisposer => {
  // Tool Selection
  hotkeys("h", (event) => {
    event.preventDefault();
    store.editor.tools.setActiveTool(ToolType.Navigate);
  });
  hotkeys("c", (event) => {
    event.preventDefault();
    store.editor.tools.setActiveTool(ToolType.Crosshair);
  });
  hotkeys("b", (event) => {
    event.preventDefault();
    store.editor.tools.setActiveTool(ToolType.Brush);
  });
  hotkeys("s", (event) => {
    event.preventDefault();
    store.editor.tools.setActiveTool(ToolType.SmartBrush);
  });
  hotkeys("e", (event) => {
    event.preventDefault();
    store.editor.tools.setActiveTool(ToolType.Eraser);
  });
  hotkeys("o", (event) => {
    event.preventDefault();
    store.editor.tools.setActiveTool(ToolType.Outline);
  });

  // Tools
  hotkeys("del,backspace", (event) => {
    event.preventDefault();
    store.editor.tools.clearSlice();
  });
  hotkeys("ctrl+del,ctrl+backspace", (event) => {
    event.preventDefault();
    store.editor.tools.clearImage();
  });

  // Brush Size
  hotkeys("*", (event) => {
    // "+" doesn't currently work with hotkeys-js (https://github.com/jaywcjlove/hotkeys/issues/270)
    if (event.key === "+" && !event.ctrlKey) {
      store.editor.tools.incrementBrushSize();
    }
  });
  hotkeys("-", () => {
    store.editor.tools.decrementBrushSize();
  });

  // Undo/Redo
  hotkeys("ctrl+z", () => {
    store.editor.undoRedo.undo();
  });
  hotkeys("ctrl+shift+z,ctrl+y", () => {
    store.editor.undoRedo.redo();
  });

  // Layer Controls
  hotkeys("m", () => {
    store.editor.setIsAnnotationVisible(!store.editor.isAnnotationVisible);
  });

  // View Types
  hotkeys("1", () => {
    store.editor.viewSettings.setMainViewType(ViewType.Transverse);
  });
  hotkeys("2", () => {
    store.editor.viewSettings.setMainViewType(ViewType.Sagittal);
  });
  hotkeys("3", () => {
    store.editor.viewSettings.setMainViewType(ViewType.Coronal);
  });
  hotkeys("0", () => {
    store.editor.viewSettings.toggleSideViews();
  });

  // Slice Navigation
  hotkeys("up", (event) => {
    event.preventDefault();
    store.editor.viewSettings.stepSelectedSlice(1);
  });
  hotkeys("shift+up", (event) => {
    event.preventDefault();
    store.editor.viewSettings.stepSelectedSlice(skipSlices);
  });
  hotkeys("down", (event) => {
    event.preventDefault();
    store.editor.viewSettings.stepSelectedSlice(-1);
  });
  hotkeys("shift+down", (event) => {
    event.preventDefault();
    store.editor.viewSettings.stepSelectedSlice(-skipSlices);
  });
  hotkeys("alt+0", (event) => {
    event.preventDefault();
    store.editor.viewSettings.setSelectedVoxel();
  });

  // Zoom
  hotkeys("*", (event) => {
    // "+" doesn't currently work with hotkeys-js (https://github.com/jaywcjlove/hotkeys/issues/270)
    if (event.key === "+" && event.ctrlKey) {
      event.preventDefault();
      store.editor.viewSettings.zoomIn();
    }
  });
  hotkeys("ctrl+-", (event) => {
    event.preventDefault();
    store.editor.viewSettings.zoomOut();
  });
  hotkeys("ctrl+0", (event) => {
    event.preventDefault();
    store.editor.viewSettings.setZoomLevel();
    store.editor.viewSettings.setOffset();
  });

  // Save & Export
  hotkeys("ctrl+s", (event) => {
    event.preventDefault();
    store.persistImmediately();
  });
  hotkeys("ctrl+e", (event) => {
    event.preventDefault();
    store.editor.quickExport();
  });
  hotkeys("ctrl+shift+e", (event) => {
    event.preventDefault();
    store.editor.quickExportSlice();
  });

  return () => hotkeys.unbind();
};
