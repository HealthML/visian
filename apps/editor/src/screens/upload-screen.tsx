/* eslint-disable no-await-in-loop */
import {
  AbsoluteCover,
  color,
  coverMixin,
  DropZone,
  Screen,
  Text,
  useIsDraggedOver,
  zIndex,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useStore } from "../app/root-store";
import { FloyBar } from "../components/editor/ai-bar";
import { IS_FLOY_DEMO } from "../constants";
import { ProgressPopUp } from "../components/editor/progress-popup";

const StartTextContainer = styled(AbsoluteCover)`
  align-items: center;
  display: flex;
  justify-content: center;
  opacity: 0.4;
`;

const StartText = styled(Text)`
  max-width: 50%;
  text-align: center;
`;

const StyledOverlay = styled.div`
  ${coverMixin}
  align-items: center;
  background-color: ${color("modalUnderlay")};
  display: flex;
  flex-direction: row;
  justify-content: center;
  pointer-events: auto;
  z-index: ${zIndex("overlay")};
`;

const StyledDropZone = styled(DropZone)`
  flex: 1;
  height: 100%;
  margin: 10% 0 10% 10%;
  max-height: 600px;
  max-width: 800px;
`;

export const UploadScreen = observer(() => {
  const [
    isDraggedOver,
    { onDrop: onDropCompleted, ...dragListeners },
  ] = useIsDraggedOver();

  const store = useStore();
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const importFiles = useCallback(
    async (_files: FileList, event: React.DragEvent) => {
      event.stopPropagation();
      setIsLoadingFiles(true);

      const dataLinks: string[] = [];
      const numberOfFiles = event.dataTransfer.files.length;
      const { files } = event.dataTransfer;
      // const file = event.dataTransfer.files[0];
      // eslint-disable-next-line no-restricted-syntax
      for (let i = 0; i < numberOfFiles; i++) {
        const file = files[i];
        const fileName = file.name;

        // Add input field for for email
        // 2) Show uploaded files on screen
        // Filter out irrelevant DICOM serieses and other filestypes than zip files
        // 3) Upload relevant serieses to S3 (TO DO: Telekom Cloud)
        // 3.1 Get unique upload URL:
        const data = await fetch(
          "https://kg0rbwuu17.execute-api.eu-central-1.amazonaws.com/uploads",
          { method: "GET" },
        );
        const dataString = await data.text();
        const uniqueUploadURL = dataString.split('"')[3];
        const fileNameKey = dataString.split('"')[7];

        // 3.2 Upload file(s)
        await axios.request({
          method: "PUT",
          url: uniqueUploadURL,
          data: file,
          onUploadProgress: (p) => {
            store?.setProgress({
              label: "Hochladen",
              progress: (i + p.loaded / p.total) / numberOfFiles,
              showSplash: false,
            });
            console.log(p.loaded / p.total);
          },
        });

        // 4) Call API after upload is finished
        dataLinks.push(
          `s3://s3uploader-s3uploadbucket-1ba2ks21gs4fb/${fileNameKey}`,
        );
      }
      store?.setProgress(); // Reset ProgressBar

      console.log("Now the API call happens:");
      store?.editor.activeDocument?.floyDemo.runBulkInferencing(
        dataLinks,
        "luca.steingen@floy.com",
      );

      setIsLoadingFiles(false);
      onDropCompleted();
    },
    [onDropCompleted],
  );

  const preventOutsideDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    [],
  );
  const handleOutsideDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      onDropCompleted();
    },
    [onDropCompleted],
  );
  return (
    <Screen
      {...dragListeners}
      title={IS_FLOY_DEMO ? "Floy Demo" : "VISIAN Editor"}
    >
      <StartTextContainer>
        <StartText tx="start-upload" />
      </StartTextContainer>
      <FloyBar useBlankScreen />
      {store?.progress && (
        <ProgressPopUp
          label={store.progress.label}
          labelTx={store.progress.labelTx}
          progress={store.progress.progress}
          showSplash={store.progress.showSplash}
        />
      )}
      {isDraggedOver && (
        <StyledOverlay
          onDrop={handleOutsideDrop}
          onDragOver={preventOutsideDrop}
        >
          {!isLoadingFiles && (
            <StyledDropZone
              isAlwaysVisible
              labelTx="drop-file"
              onFileDrop={importFiles}
            />
          )}
        </StyledOverlay>
      )}
    </Screen>
  );
});

export default UploadScreen;
