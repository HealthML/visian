import { i18n, LocalForageBackend } from "@visian/ui-shared";
import { getWHOTaskIdFromUrl, isFromWHO, readFileFromURL } from "@visian/utils";
import React from "react";

import { storePersistInterval } from "../constants";
import { RootStore } from "../models";

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
    window.alert(i18n.t("data-model-outdated-alert"));
    await store.destroy(true);
  }

  (async () => {
    const url = new URL(window.location.href);

    if (url.searchParams.has("tracking")) {
      store.initializeTracker();
    }

    try {
      // Load scan based on GET parameter
      // Example: http://localhost:4200/?load=http://data.idoimaging.com/nifti/1010_brain_mr_04.nii.gz
      const loadScanParam = url.searchParams.get("load");
      if (loadScanParam && store.editor.newDocument()) {
        store.setProgress({ labelTx: "importing", showSplash: true });
        await store.editor.activeDocument?.importFiles(
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
      // Load scan from WHO
      // Example: http://localhost:4200/?origin=who&taskId=0b2fb698-6e1d-4682-a986-78b115178d94
      const taskId = getWHOTaskIdFromUrl();
      if (taskId) await store.loadWHOTask(taskId);
    }
  })();

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
