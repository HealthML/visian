import { i18n, LocalForageBackend } from "@visian/ui-shared";
import { getWHOTaskIdFromUrl, isFromWHO, readFileFromURL } from "@visian/utils";
import React from "react";
import {
  FLOY_TOKEN_KEY,
  IS_FLOY_DEMO,
  storePersistInterval,
} from "../constants";
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

    if (IS_FLOY_DEMO) {
      const tokenParam = url.searchParams.get("token");
      if (tokenParam) {
        localStorage.setItem(FLOY_TOKEN_KEY, tokenParam);
      }
    }

    // Load scan based on GET parameter
    // Example:  http://localhost:4200/?study=2234231
    const study = url.searchParams.get("study");
    // Check if param was passed:
    if (study != null) {
      try {
        // Get names:
        const studyName = `${study}.zip`;
        const maskName = `${study}.nii.gz`;

        // Call Floy-API to generate signedDownloadURL to OTC OBS:
        const responseStudy = await store?.editor.activeDocument?.floyDemo.getSignedDownloadURL(
          `raw-data/demo-floy-com-production/${studyName}`,
          "PPwqqg08m", // TO DO - Remove and create extra token-less API request for the load-links
        );
        const responseMask = await store?.editor.activeDocument?.floyDemo.getSignedDownloadURL(
          `raw-data/demo-floy-com-production/${maskName}`,
          "PPwqqg08m", // TO DO - Remove and create extra token-less API request for the load-links
        );

        if (responseStudy === undefined || responseMask === undefined) {
          // eslint-disable-next-line no-console
          console.log("Error: Should never happen");
        } else {
          const signedDownloadURLStudy = responseStudy[0];
          const signedDownloadURLMask = responseMask[0];

          if (
            signedDownloadURLStudy &&
            signedDownloadURLMask &&
            store.editor.newDocument()
          ) {
            store.setProgress({ labelTx: "importing", showSplash: true });
            // Download study and show in Demo:
            await store.editor.activeDocument?.importFiles(
              await readFileFromURL(signedDownloadURLStudy, false),
            );
            // Download mask and show in Demo:
            let classification: string;
            try {
              await store.editor.activeDocument?.importFiles(
                await readFileFromURL(signedDownloadURLMask, false).catch(
                  () => {
                    throw new Error("Hi");
                  },
                ),
                "Bounding Boxen",
                true,
              );
              classification = "1";
            } catch {
              // No mask file available on this study (negative study)
              classification = "0";
            }
            store?.editor.activeDocument?.floyDemo.setInferenceResults([
              { classification },
            ]);

            // Show inference result in FloyBar:
            store.editor.activeDocument?.finishBatchImport();
            store.setProgress();
          }

          // Clean up URL
          // if (url.searchParams.get("demo") === null) {
          //   window.history.replaceState(
          //     {},
          //     document.title,
          //     window.location.pathname,
          //   );
          // }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log("error:", e);
        store.setError({
          titleTx: "import-error",
          descriptionTx: "remote-file-error",
        });
        store.editor.setActiveDocument();
      }
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
