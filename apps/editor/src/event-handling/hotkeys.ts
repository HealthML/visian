import { IDisposer, ViewType } from "@visian/utils";
import hotkeys from "hotkeys-js";

import type { RootStore } from "../models";

export const setUpHotKeys = (store: RootStore): IDisposer => {
  hotkeys.filter = () => true;
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
  hotkeys("del", (event) => {
    event.preventDefault();
    store.editor.tools.clearSlice();
  });
  hotkeys("ctrl+del", (event) => {
    event.preventDefault();
    store.editor.tools.clearImage();
  });

  // Undo/Redo
  hotkeys("ctrl+z", () => {
    store.editor.undoRedo.undo();
  });
  hotkeys("ctrl+shift+z,ctrl+y", () => {
    store.editor.undoRedo.redo();
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
