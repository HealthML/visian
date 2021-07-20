import {
  color,
  coverMixin,
  DropZone,
  useModalRoot,
  zIndex,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import path from "path";
import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { DropSheetProps } from "./drop-sheet.props";

const StyledDropZone = styled(DropZone)`
  flex: 1;
  height: 100%;
  margin: 10% 0 10% 10%;
  max-height: 600px;
  max-width: 800px;
`;

const StyledOverlay = styled.div`
  ${coverMixin}

  align-items: center;
  background-color: ${color("modalUnderlay")};
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding-right: 10%;
  pointer-events: auto;
  z-index: ${zIndex("overlay")};
`;

const getFileExtension = (file: File) => path.extname(file.name);

export const DropSheet: React.FC<DropSheetProps> = observer(
  ({ onDropCompleted }) => {
    const store = useStore();

    const importSingleFile = useCallback(
      async (file: File) => {
        // Exclude hidden system files from import
        if (file.name.startsWith(".")) return;
        try {
          await store?.editor.activeDocument?.importFile(file);
        } catch (error) {
          store?.setError({
            titleTx: "import-error",
            descriptionTx: error.message,
          });
        }
      },
      [store],
    );

    const importFileList = useCallback(
      async (dirFiles: File[], dirName: string | undefined) => {
        // Check if file list belongs together
        if (dirFiles.some((file) => getFileExtension(file) !== ".dcm")) {
          const promises: Promise<void>[] = [];
          dirFiles.forEach((file) => promises.push(importSingleFile(file)));
          await Promise.all(promises);
        } else {
          await store?.editor.activeDocument?.importFile(dirFiles, dirName);
        }
      },
      [importSingleFile, store?.editor.activeDocument],
    );

    const importFileEntry = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (entry: any) =>
        new Promise<void>((resolve) => {
          entry.file(async (file: File) => {
            await importSingleFile(file);
            resolve();
          });
        }),
      [importSingleFile],
    );

    const importDirectoryEntry = useCallback(
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
          } else {
            promises.push(importDirectoryEntry(entries[i]));
          }
        }
        await Promise.all(promises);

        if (dirFiles.length) {
          await importFileList(dirFiles, dirName);
        }
      },
      [importFileList],
    );

    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const importFiles = useCallback(
      (files: FileList, event: React.DragEvent) => {
        (async () => {
          event.stopPropagation();
          setIsLoadingFiles(true);

          try {
            const { items } = event.dataTransfer;
            const promises: Promise<void>[] = [];
            for (let fileIndex = 0; fileIndex < items.length; fileIndex++) {
              const item = event.dataTransfer.items[fileIndex];
              const entry = item?.webkitGetAsEntry();
              if (entry) {
                if (entry.isDirectory) {
                  promises.push(importDirectoryEntry(entry));
                } else {
                  promises.push(importFileEntry(entry));
                }
              }
            }
            await Promise.all(promises);
          } catch (error) {
            store?.setError({
              titleTx: "import-error",
              descriptionTx: error.message,
            });
          }
          store?.editor.activeDocument?.finishBatchImport();
          setIsLoadingFiles(false);
          store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
          onDropCompleted();
        })();
      },
      [importDirectoryEntry, importFileEntry, onDropCompleted, store],
    );

    const preventOutsideDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    };

    const handleOutsideDrop = useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        onDropCompleted();
      },
      [onDropCompleted],
    );

    const modalRootRef = useModalRoot();
    const node = (
      <StyledOverlay onDrop={handleOutsideDrop} onDragOver={preventOutsideDrop}>
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
