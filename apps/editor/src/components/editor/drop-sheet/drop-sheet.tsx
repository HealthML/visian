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

export const DropSheet: React.FC<DropSheetProps> = observer(
  ({ onDropCompleted }) => {
    const store = useStore();

    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const importImage = useCallback(
      (files: FileList, event: React.DragEvent) => {
        (async () => {
          setIsLoadingImage(true);
          try {
            const item = event.dataTransfer.items[0];
            const entry = item?.webkitGetAsEntry();
            const dirFiles: File[] = [];
            let dirName: string | undefined;
            if (entry && entry.isDirectory) {
              dirName = entry.name;
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
            }

            if (dirFiles.length) {
              await store?.editor.activeDocument?.importImage(
                dirFiles,
                dirName,
              );
            } else {
              await store?.editor.activeDocument?.importImage(files[0]);
            }
            store?.setError();
          } catch (error) {
            store?.setError({
              titleTx: "import-error",
              descriptionTx: error.message,
            });
          }
          setIsLoadingImage(false);
          store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
          onDropCompleted();
        })();
      },
      [onDropCompleted, store],
    );

    const [isLoadingAnnotation, setIsLoadingAnnotation] = useState(false);
    const importAnnotation = useCallback(
      (files: FileList) => {
        (async () => {
          setIsLoadingAnnotation(true);
          try {
            await store?.editor.activeDocument?.importAnnotation(files[0]);
            store?.setError();
          } catch (error) {
            store?.setError({
              titleTx: "import-error",
              descriptionTx: error.message,
            });
          }
          setIsLoadingAnnotation(false);
          store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
          onDropCompleted();
        })();
      },
      [onDropCompleted, store],
    );

    const modalRootRef = useModalRoot();
    const node = (
      <StyledOverlay>
        <StyledDropZone
          isAlwaysVisible
          labelTx={isLoadingImage ? "loading" : "drop-image"}
          onFileDrop={importImage}
        />
        <StyledDropZone
          isAlwaysVisible
          labelTx={isLoadingAnnotation ? "loading" : "drop-annotation"}
          onFileDrop={importAnnotation}
        />
      </StyledOverlay>
    );

    return modalRootRef.current
      ? ReactDOM.createPortal(node, modalRootRef.current)
      : node;
  },
);
