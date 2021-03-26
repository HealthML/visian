import { IDisposer } from "@visian/util";
import hotkeys from "hotkeys-js";

import { ViewType } from "../rendering";

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

  return () => hotkeys.unbind();
};
