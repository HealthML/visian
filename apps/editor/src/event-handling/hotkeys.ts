import { IDisposer, ViewType, writeSingleMedicalImage } from "@visian/utils";
import hotkeys from "hotkeys-js";
import FileSaver from "file-saver";

import type { RootStore } from "../models";

export const setUpHotKeys = (store: RootStore): IDisposer => {
  hotkeys.filter = () => true;
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

    const image = store.editor.annotation;
    if (!image) return;

    writeSingleMedicalImage(
      image.toITKImage(),
      `${image.name.split(".")[0]}_edited.nii.gz`,
    ).then((file) => {
      if (!file) return;

      FileSaver.saveAs(file, file.name);
    });
  });

  return () => hotkeys.unbind();
};
