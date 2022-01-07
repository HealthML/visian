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
      // const { items } = event.dataTransfer;
      // console.debug("item: ", event.dataTransfer.items);
      // console.debug("Files: ", event.dataTransfer.files);
      console.debug("Files instance: ", event.dataTransfer.files[0]);
      // console.debug("Files instance text: ", await event.dataTransfer.files[0].text());

      const fileBinary = await event.dataTransfer.files[0].text();
      // console.debug("fileBinary: ", fileBinary);

      // Add input field for for email
      // 1) Show Upload-loading Bar while uploading
      // 2) Show uploaded files on screen
      // 3) Upload relevant serieses to S3 (later Telekom Cloud)

      const data = await fetch(
        "https://kg0rbwuu17.execute-api.eu-central-1.amazonaws.com/uploads",
        { method: "GET" },
      );
      const URL = (await data.text()).split('":"').join('","').split('","')[1];
      const blobData = new Blob([fileBinary], {
        type: "text/jpg;charset=UTF-8",
      });

      console.log("blobData: ", blobData);

      await fetch(URL, {
        method: "PUT",
        body: blobData,
      });

      // 4) Call API after upload is finished
      // store?.editor.activeDocument?.floyDemo.runBulkInferencing();

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
