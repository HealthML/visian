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
import { useStore } from "../app/root-store";
import { FloyBar } from "../components/editor/ai-bar";
import { IS_FLOY_DEMO } from "../constants";

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

      const file = event.dataTransfer.files[0];
      const fileName = file.name;
      const fileBinary = (await file.stream().getReader().read()).value; // Currently only works with files up to 64kb

      console.debug("file: ", file);
      // console.debug("fileName: ", fileName);
      console.debug("fileBinary: ", fileBinary);

      // Add input field for for email
      // 1) Show Upload-loading Bar while uploading
      // 2) Show uploaded files on screen

      // Filter out irrelevant DICOM serieses and other filestypes than zip files

      // 3) Upload relevant serieses to S3 (later Telekom Cloud)
      // 3.1 Get unique upload URL:
      const data = await fetch(
        "https://kg0rbwuu17.execute-api.eu-central-1.amazonaws.com/uploads",
        { method: "GET" },
      );
      const dataString = await data.text();
      const uniqueUploadURL = dataString.split('"')[3];
      const fileNameKey = dataString.split('"')[7];

      // 3.2 Upload file(s)
      await fetch(uniqueUploadURL, {
        method: "PUT",
        body: new Blob([fileBinary]),
      });

      const dataLinks: string[] = [];
      dataLinks.push(
        `s3://s3uploader-s3uploadbucket-1ba2ks21gs4fb/${fileNameKey}`,
      );
      // TO DO: Pass link list to runBulkInferencing()

      // 4) Call API after upload is finished
      store?.editor.activeDocument?.floyDemo.runBulkInferencing();

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
