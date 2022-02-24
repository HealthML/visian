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

    try {
      // Load scan based on GET parameter
      // Example: http://localhost:4200/?load=http://data.idoimaging.com/nifti/1010_brain_mr_04.nii.gz
      // signedURL generation from parameter
      const studySig = url.searchParams.get("studySig");
      const maskSig = url.searchParams.get("maskSig");
      const studyFile = url.searchParams.get("studyFile");
      const maskFile = url.searchParams.get("maskFile");

      const signedStudyURL =
        "https://obs.eu-de.otc.t-systems.com/floy/demo.floy.com-uploads/" +
        encodeURIComponent(studyFile) +
        "?AWSAccessKeyId=UXFZMXZO3DFYLN1UUNAI" +
        "&Expires=2000000000" +
        "&Signature=" +
        encodeURIComponent(studySig);

      // https://floy.obs.eu-de.otc.t-systems.com/demo.floy.com-uploads/2234231.zip?AWSAccessKeyId=UXFZMXZO3DFYLN1UUNAI&Expires=2000000000&Signature=5S5XLzRnKD7isC%2FfzByJqwatAMQ%3D
      // https://obs.eu-de.otc.t-systems.com/floy/demo.floy.com-uploads/2234231.zip?AWSAccessKeyId=UXFZMXZO3DFYLN1UUNAI&Expires=2000000000&Signature=5S5XLzRnKD7isC/fzByJqwatAMQ=

      // http://localhost:4200/?studySig=5S5XLzRnKD7isC%2FfzByJqwatAMQ%3D&studyFile=2234231.zip

      // URL encoding
      const encodedURL = encodeURIComponent(url.href);
      console.log("signedStudyURL: ", signedStudyURL);
      console.log("mask: ", maskSig);
      console.log("url: ", url);
      console.log("encodedURL: ", encodedURL);

      if (signedStudyURL && store.editor.newDocument()) {
        // store.setProgress({ labelTx: "importing", showSplash: false });
        await store.editor.activeDocument?.importFiles(
          await readFileFromURL(signedStudyURL, false),
        );
        store.editor.activeDocument?.finishBatchImport();

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
      console.log("error:", e);
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
