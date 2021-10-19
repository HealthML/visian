import {
  color,
  coverMixin,
  DropZone,
  useModalRoot,
  useTranslation,
  zIndex,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
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

export const DropSheet: React.FC<DropSheetProps> = observer(
  ({ onDropCompleted }) => {
    const store = useStore();
    const { t } = useTranslation();

    const [isLoadingFiles, setIsLoadingFiles] = useState(false);

    const importFilesFromFileSystemEntries = useCallback(
      async (entries: FileSystemEntry[]) => {
        try {
          await store?.editor.activeDocument?.importFileSystemEntries(entries);
        } catch (error) {
          const errorMessage = (error as Error).message;
          if (errorMessage.startsWith("image-mismatch-error")) {
            if (store?.editor.newDocument()) {
              await importFilesFromFileSystemEntries(entries);
            } else {
              const messageParts = errorMessage.split(":");
              store?.setError({
                titleTx: "import-error",
                description: t(messageParts[0], {
                  fileName: messageParts[1],
                }),
              });
            }
          } else {
            store?.setError({
              titleTx: "import-error",
              descriptionTx: errorMessage,
            });
          }
        }
      },
      [store, t],
    );

    const importFiles = useCallback(
      async (_files: FileList, event: React.DragEvent) => {
        event.stopPropagation();
        setIsLoadingFiles(true);
        store?.setProgress({ labelTx: "importing" });

        const { items } = event.dataTransfer;
        const entries: FileSystemEntry[] = [];
        for (let fileIndex = 0; fileIndex < items.length; fileIndex++) {
          const item = items[fileIndex];
          const entry = item?.webkitGetAsEntry();
          if (entry) entries.push(entry);
        }
        await importFilesFromFileSystemEntries(entries);
        store?.editor.activeDocument?.finishBatchImport();
        store?.setProgress();
        setIsLoadingFiles(false);
        store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
        onDropCompleted();
      },
      [importFilesFromFileSystemEntries, onDropCompleted, store],
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
        {!isLoadingFiles && (
          <StyledDropZone
            isAlwaysVisible
            labelTx="drop-file"
            onFileDrop={importFiles}
          />
        )}
      </StyledOverlay>
    );

    return modalRootRef.current
      ? ReactDOM.createPortal(node, modalRootRef.current)
      : node;
  },
);
