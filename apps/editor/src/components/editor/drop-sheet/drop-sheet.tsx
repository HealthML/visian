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
import { importFilesToDocument } from "../../../import-handling";
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
      async (_files: FileList, event: React.DragEvent) => {
        event.stopPropagation();
        if (!store) return;
        setIsLoadingFiles(true);
        const { items } = event.dataTransfer;
        importFilesToDocument(items, store, true);
        setIsLoadingFiles(false);
        store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
        onDropCompleted();
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
