import {
  color,
  coverMixin,
  DropZone,
  useModalRoot,
  zIndex,
} from "@visian/ui-shared";
import { readMedicalImage } from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { DropSheetProps } from "./drop-sheet.props";

const StyledDropZone = styled(DropZone)`
  flex: 1;
  margin: 10% 0 10% 10%;
`;

const StyledOverlay = styled.div`
  ${coverMixin}

  align-items: stretch;
  background-color: ${color("modalUnderlay")};
  display: flex;
  flex-direction: row;
  padding-right: 10%;
  pointer-events: auto;
  z-index: ${zIndex("overlay")};
`;

const uniqueValuesForAnnotationThreshold = 20;

const isFileAnnotation = async (file: File) => {
  const image = await readMedicalImage(file);
  const { data } = image;
  const uniqueValues = new Set();
  for (let index = 0; index < data.length; index++) {
    uniqueValues.add(data[index]);
    if (uniqueValues.size > uniqueValuesForAnnotationThreshold) {
      return false;
    }
  }
  return true;
};

export const DropSheet: React.FC<DropSheetProps> = observer(
  ({ onDropCompleted }) => {
    const store = useStore();

    const importSingleFile = useCallback(
      async (file: File) => {
        if (await isFileAnnotation(file)) {
          await store?.editor.activeDocument?.importAnnotation(file);
        } else {
          await store?.editor.activeDocument?.importImage(file);
        }
      },
      [store?.editor.activeDocument],
    );

    const importFileList = useCallback(
      async (dirFiles: File[], dirName: string | undefined) => {
        if (await isFileAnnotation(dirFiles[0])) {
          await store?.editor.activeDocument?.importAnnotation(
            dirFiles,
            dirName,
          );
        } else {
          await store?.editor.activeDocument?.importImage(dirFiles, dirName);
        }
      },
      [store?.editor.activeDocument],
    );

    const getFile = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (fileEntry: any) => {
        try {
          return await new Promise<File>((resolve, reject) =>
            fileEntry.file(resolve, reject),
          );
        } catch (error) {
          store?.setError({
            titleTx: "import-error",
            descriptionTx: error.message,
          });
        }
      },
      [store],
    );

    const importFileItem = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (entry: any) => {
        const file = await getFile(entry);
        if (file) await importSingleFile(file);
      },
      [getFile, importSingleFile],
    );

    const importDirectoryItem = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (entry: any) => {
        const dirFiles: File[] = [];
        const dirName = entry.name;
        const dirReader = entry.createReader();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entries = await new Promise<any[]>((resolve) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dirReader.readEntries((result: any[]) => {
            resolve(result);
          });
        });

        const promises: Promise<void>[] = [];
        const { length } = entries;
        for (let i = 0; i < length; i++) {
          if (entries[i].isFile) {
            promises.push(
              new Promise((resolve) => {
                entries[i].file((file: File) => {
                  dirFiles.push(file);
                  resolve();
                });
              }),
            );
          }
        }
        await Promise.all(promises);

        if (dirFiles.length) {
          if (dirFiles.length > 1) {
            await importFileList(dirFiles, dirName);
          } else {
            await importSingleFile(dirFiles[0]);
          }
        }
      },
      [importFileList, importSingleFile],
    );

    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const importFiles = useCallback(
      (files: FileList, event: React.DragEvent) => {
        (async () => {
          setIsLoadingFiles(true);
          try {
            const { items } = event.dataTransfer;
            const promises: Promise<void>[] = [];
            for (let fileIndex = 0; fileIndex < items.length; fileIndex++) {
              const item = event.dataTransfer.items[0];
              const entry = item?.webkitGetAsEntry();
              if (entry) {
                if (entry.isDirectory) {
                  promises.push(importDirectoryItem(entry));
                } else {
                  promises.push(importFileItem(entry));
                }
              }
            }
            await Promise.all(promises);
            // const item = event.dataTransfer.items[0];
            // // console.log(event.dataTransfer.items);
            // const entry = item?.webkitGetAsEntry();
            // const dirFiles: File[] = [];
            // let dirName: string | undefined;
            // if (entry && entry.isDirectory) {
            //   dirName = entry.name;
            //   const dirReader = entry.createReader();
            //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
            //   const entries = await new Promise<any[]>((resolve) => {
            //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
            //     dirReader.readEntries((result: any[]) => {
            //       resolve(result);
            //     });
            //   });

            //   const promises: Promise<void>[] = [];
            //   const { length } = entries;
            //   for (let i = 0; i < length; i++) {
            //     if (entries[i].isFile) {
            //       promises.push(
            //         new Promise((resolve) => {
            //           entries[i].file((file: File) => {
            //             dirFiles.push(file);
            //             resolve();
            //           });
            //         }),
            //       );
            //     }
            //   }
            //   await Promise.all(promises);
            // }

            // if (dirFiles.length) {
            //   if (await isFileAnnotation(dirFiles[0])) {
            //     await store?.editor.activeDocument?.importAnnotation(
            //       dirFiles,
            //       dirName,
            //     );
            //   } else {
            //     await store?.editor.activeDocument?.importImage(
            //       dirFiles,
            //       dirName,
            //     );
            //   }
            // } else if (await isFileAnnotation(files[0])) {
            //   await store?.editor.activeDocument?.importAnnotation(files[0]);
            // } else {
            //   await store?.editor.activeDocument?.importImage(files[0]);
            // }
            store?.setError();
          } catch (error) {
            store?.setError({
              titleTx: "import-error",
              descriptionTx: error.message,
            });
          }
          setIsLoadingFiles(false);
          store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
          onDropCompleted();
        })();
      },
      [importDirectoryItem, importFileItem, onDropCompleted, store],
    );

    const modalRootRef = useModalRoot();
    const node = (
      <StyledOverlay>
        <StyledDropZone
          isAlwaysVisible
          labelTx={isLoadingFiles ? "loading" : "drop-file"}
          onFileDrop={importFiles}
        />
      </StyledOverlay>
    );

    return modalRootRef.current
      ? ReactDOM.createPortal(node, modalRootRef.current)
      : node;
  },
);
