import { IDisposer, ViewType } from "@visian/utils";
import hotkeys from "hotkeys-js";

import type { RootStore } from "../models";

export const setUpHotKeys = (store: RootStore): IDisposer => {
  hotkeys.filter = () => true;
  hotkeys("ctrl+s", (event) => {
    event.preventDefault();
    store.persistImmediately();
  });
  hotkeys("t", () => {
    store.editor.viewSettings.setMainView(ViewType.Transverse);
  });
  hotkeys("s", () => {
    store.editor.viewSettings.setMainView(ViewType.Sagittal);
  });
  hotkeys("c", () => {
    store.editor.viewSettings.setMainView(ViewType.Coronal);
  });
  hotkeys("v", () => {
    store.editor.viewSettings.toggleSideViews();
  });
  hotkeys("del", () => {
    store.editor.tools.clearSlice();
  });
  hotkeys("ctrl+del", () => {
    store.editor.tools.clearImage();
  });
  hotkeys("ctrl+z", () => {
    store.editor.undoRedo.undo();
  });
  hotkeys("ctrl+shift+z,ctrl+y", () => {
    store.editor.undoRedo.redo();
  });

  return () => hotkeys.unbind();
};
