import { ImageMismatchError } from "@visian/utils";
import { RootStore } from "../models";

const importFilesByType = async (
  files: FileList | DataTransferItemList,
  store: RootStore,
) => {
  if (files instanceof DataTransferItemList) {
    const entries: FileSystemEntry[] = [];
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      const item = files[fileIndex];
      const entry = item?.webkitGetAsEntry();
      if (entry) entries.push(entry);
    }
    await store?.editor.activeDocument?.importFileSystemEntries(entries);
  } else {
    await store?.editor.activeDocument?.importFiles(Array.from(files));
  }
};

const handleImportWithErrors = async (
  files: FileList | DataTransferItemList,
  store: RootStore,
  shouldRetry = false,
) => {
  try {
    await importFilesByType(files, store);
  } catch (error) {
    if (shouldRetry && error instanceof ImageMismatchError) {
      if (store?.editor.newDocument()) {
        await handleImportWithErrors(files, store, false);
      } else {
        store?.setError({
          titleTx: "import-error",
          description: error.message,
        });
      }
    } else {
      store?.setError({
        titleTx: "import-error",
        descriptionTx: (error as Error).message,
      });
    }
  }

  store?.editor.activeDocument?.finishBatchImport();
};

export const importFilesToDocument = (
  files: FileList | DataTransferItemList,
  store: RootStore,
  shouldRetry = false,
  handleFinishedImport?: () => void,
) => {
  if (!files.length) return;
  store?.setProgress({ labelTx: "importing" });

  handleImportWithErrors(files, store, shouldRetry).then(() => {
    store?.setProgress();
    handleFinishedImport?.();
  });
};
