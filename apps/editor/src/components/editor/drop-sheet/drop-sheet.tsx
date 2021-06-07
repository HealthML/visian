import { color, coverMixin, DropZone, zIndex } from "@visian/ui-shared";
import { readMedicalImage } from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
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

    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const importFiles = useCallback(
      (files: FileList, event: React.DragEvent) => {
        (async () => {
          setIsLoadingFiles(true);
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
              if (await isFileAnnotation(dirFiles[0])) {
                await store?.editor.activeDocument?.importAnnotation(
                  dirFiles,
                  dirName,
                );
              } else {
                await store?.editor.activeDocument?.importImage(
                  dirFiles,
                  dirName,
                );
              }
            } else if (await isFileAnnotation(files[0])) {
              await store?.editor.activeDocument?.importAnnotation(files[0]);
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
          setIsLoadingFiles(false);
          store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
          onDropCompleted();
        })();
      },
      [onDropCompleted, store],
    );

    return (
      <StyledOverlay>
        <StyledDropZone
          isAlwaysVisible
          labelTx={isLoadingFiles ? "loading" : "drop-file"}
          onFileDrop={importFiles}
        />
      </StyledOverlay>
    );
  },
);
