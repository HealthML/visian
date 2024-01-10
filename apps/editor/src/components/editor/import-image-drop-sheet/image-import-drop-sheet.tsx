import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";

import { ImageImportDropSheetProps } from "./image-import-drop-sheet.props";
import { useStore } from "../../../app/root-store";
import { importFilesToDocument } from "../../../import-handling";
import { DropSheet } from "../drop-sheet";

export const ImageImportDropSheet: React.FC<ImageImportDropSheetProps> =
  observer(({ onDropCompleted }) => {
    const store = useStore();

    const importFiles = useCallback(
      async (_files: FileList) => {
        if (!store) return;
        importFilesToDocument(_files, store, true);
        store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
        onDropCompleted();
      },
      [onDropCompleted, store],
    );

    return (
      <DropSheet onDropCompleted={onDropCompleted} importFiles={importFiles} />
    );
  });
