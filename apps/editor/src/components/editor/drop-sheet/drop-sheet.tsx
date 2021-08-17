import {
  color,
  coverMixin,
  DropZone,
  useModalRoot,
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
              const promise = store?.editor.activeDocument?.importFileSystemEntry(
                entry,
              );
              if (promise) promises.push(promise);
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
      [onDropCompleted, store],
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
