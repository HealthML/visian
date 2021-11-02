import { ImageMismatchError } from "@visian/utils";
import { RootStore } from "../models";

const importFilesByType = async (
  files: FileList | FileSystemEntry[],
  store: RootStore,
) => {
  if (files instanceof FileList) {
    await store.editor.activeDocument?.importFiles(Array.from(files));
  } else {
    await store.editor.activeDocument?.importFileSystemEntries(files);
  }
};

const getFileSystemEntriesFromDataTransfer = (items: DataTransferItemList) => {
  const entries: FileSystemEntry[] = [];
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    const item = items[itemIndex];
    const entry = item?.webkitGetAsEntry();
    if (entry) entries.push(entry);
  }
  return entries;
};

const handleImportWithErrors = async (
  files: FileList | DataTransferItemList | FileSystemEntry[],
  store: RootStore,
  shouldRetry = false,
) => {
  const filesForImport =
    files instanceof DataTransferItemList
      ? getFileSystemEntriesFromDataTransfer(files)
      : files;
  try {
    await importFilesByType(filesForImport, store);
  } catch (error) {
    if (shouldRetry && error instanceof ImageMismatchError) {
      if (store.editor.newDocument()) {
        await handleImportWithErrors(filesForImport, store, false);
      } else {
        store.setError({
          titleTx: "import-error",
          description: error.message,
        });
      }
    } else {
      store.setError({
        titleTx: "import-error",
        descriptionTx: (error as Error).message,
      });
    }
  }

  store.editor.activeDocument?.finishBatchImport();
};

export const importFilesToDocument = (
  files: FileList | DataTransferItemList,
  store: RootStore,
  shouldRetry = false,
  handleFinishedImport?: () => void,
) => {
  if (!files.length) return;
  store.setProgress({ labelTx: "importing" });

  handleImportWithErrors(files, store, shouldRetry).then(() => {
    store.setProgress();
    handleFinishedImport?.();
  });
};
