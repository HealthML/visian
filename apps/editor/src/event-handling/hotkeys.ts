import { IDisposer, ViewType } from "@visian/utils";
import hotkeys from "hotkeys-js";

import { skipSlices } from "../constants";

import type { RootStore } from "../models";

export const setUpHotKeys = (store: RootStore): IDisposer => {
  hotkeys.filter = () => true;

  // Tools
  hotkeys("del", (event) => {
    event.preventDefault();
    store.editor.tools.clearSlice();
  });
  hotkeys("ctrl+del", (event) => {
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

  // View Types
  hotkeys("t", () => {
    store.editor.viewSettings.setMainViewType(ViewType.Transverse);
  });
  hotkeys("s", () => {
    store.editor.viewSettings.setMainViewType(ViewType.Sagittal);
  });
  hotkeys("c", () => {
    store.editor.viewSettings.setMainViewType(ViewType.Coronal);
  });
  hotkeys("v", () => {
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
    store.editor.viewSettings.setZoomLevel(1);
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

  return () => hotkeys.unbind();
};
