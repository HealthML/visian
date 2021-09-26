import { LocalForageBackend } from "@visian/ui-shared";
import {
  createFileFromBase64,
  getWHOTask,
  getWHOTaskIdFromUrl,
  isFromWHO,
  readFileFromURL,
} from "@visian/utils";
import React from "react";

import { storePersistInterval } from "../constants";
import { RootStore } from "../models";
import { Task, TaskType } from "../models/who";

export const storageBackend = new LocalForageBackend(
  storePersistInterval,
  "STORE",
);

export const setupRootStore = async () => {
  const store = new RootStore({ storageBackend });
  try {
    await store.rehydrate();
  } catch (err) {
    // TODO: Resolve old data models after breaking changes more gracefully
    // eslint-disable-next-line no-alert
    window.alert("Data model outdated. Reset required.");
    await store.destroy(true);
  }

  const url = new URL(window.location.href);
  try {
    // Load scan based on GET parameter
    // Example: http://localhost:4200/?load=http://data.idoimaging.com/nifti/1010_brain_mr_04.nii.gz
    const loadScanParam = url.searchParams.get("load");
    if (loadScanParam && store.editor.newDocument()) {
      await store.editor.activeDocument?.importFile(
        await readFileFromURL(loadScanParam, true),
      );
      store.editor.activeDocument?.finishBatchImport();
      if (url.searchParams.get("demo") === null) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
    }
  } catch {
    store.setError({
      titleTx: "import-error",
      descriptionTx: "remote-file-error",
    });
    store.editor.setActiveDocument();
  }

  if (isFromWHO()) {
    try {
      const taskId = getWHOTaskIdFromUrl();
      if (taskId && store.editor.newDocument(true)) {
        const taskJson = await getWHOTask(taskId);
        const whoTask = new Task(taskJson);
        store.setCurrentTask(whoTask);

        await store.editor.activeDocument?.importFile(
          createFileFromBase64(
            whoTask.samples[0].title,
            whoTask.samples[0].data,
          ),
          undefined,
          false,
        );
        if (whoTask.kind === TaskType.Create) {
          store.editor.activeDocument?.finishBatchImport();
          store.currentTask?.addNewAnnotation();
        } else {
          // Task Type is Correct or Review
          await store.editor.activeDocument?.importFile(
            createFileFromBase64(
              whoTask.samples[0].title
                .replace(".nii", "_annotation")
                .concat(".nii"),
              whoTask.annotations[0].data[0].data,
            ),
            whoTask.samples[0].title.replace(".nii", "_annotation"),
            true,
          );
        }
      }
    } catch {
      store.setError({
        titleTx: "import-error",
        descriptionTx: "remote-file-error",
      });
      store.editor.setActiveDocument();
    }
  }

  window.addEventListener("beforeunload", (event) => {
    if (store.isDirty) {
      event.preventDefault();
      event.returnValue =
        "Changes you made may not be saved. Try again in a few seconds.";
      return event.returnValue;
    }
    delete event.returnValue;
  });

  return store;
};

const storeContext = React.createContext<RootStore | null>(null);
export const StoreProvider = storeContext.Provider;
export const useStore = () => React.useContext(storeContext);
