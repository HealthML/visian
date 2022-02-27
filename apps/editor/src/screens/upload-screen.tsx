/* eslint-disable no-await-in-loop */
import {
  AbsoluteCover,
  Button,
  color,
  coverMixin,
  DropZone,
  PopUp,
  Screen,
  Text,
  useIsDraggedOver,
  zIndex,
} from "@visian/ui-shared";
import { extractSeriesFromFileSystemEntries } from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useStore } from "../app/root-store";
import { FloyBar } from "../components/editor/ai-bar";
import { ProgressPopUp } from "../components/editor/progress-popup";
import { FLOY_TOKEN_KEY, IS_FLOY_DEMO } from "../constants";
import { getFileSystemEntriesFromDataTransfer } from "../import-handling";

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

const StyledParagraph = styled(Text)`
  margin-bottom: 10px;
`;

const FloyPopUp = styled(PopUp)`
  max-height: 75%;
  max-width: 600px;
  overflow: auto;
`;

const PopUpButton = styled(Button)`
  margin-top: 10px;
  align-self: center;
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
  const [mail, setMail] = useState("");
  const [approxBulkTime, setApproxBulkTime] = useState<string>();
  const [showProgressPopUp, setShowProgressPopUp] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const store = useStore();
  const [
    isDraggedOver,
    { onDrop: onDropCompleted, ...dragListeners },
  ] = useIsDraggedOver();
  const dismissProgressPopUp = useCallback(() => {
    setShowProgressPopUp(false);
  }, []);

  const importFiles = useCallback(
    async (_files: FileList, event: React.DragEvent) => {
      if (!store?.editor.activeDocument) return;

      onDropCompleted();
      event.stopPropagation();
      setIsLoadingFiles(true);
      store.setProgress({ labelTx: "importing", showSplash: true });

      try {
        // Extract, filter & prepare series for upload
        const series = await extractSeriesFromFileSystemEntries(
          getFileSystemEntriesFromDataTransfer(event.dataTransfer.items),
        );
        const seriesMask = await Promise.all(
          series.map(store.editor.activeDocument.floyDemo.isDemoCandidate),
        );
        const zips = await Promise.all(
          series
            .filter((_value, index) => seriesMask[index])
            .map((files) =>
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              store.editor.activeDocument!.floyDemo.prepareSeriesZip(files),
            ),
        );

        if (!zips.length) {
          store.setProgress();
          return;
        }

        const signedDownloadURLs: string[] = [];
        for (let index = 0; index < zips.length; index++) {
          // Generate .zip filename:
          const zipFile = zips[index];
          const randomID = parseInt(
            (Math.random() * 1000000000000000).toString(),
          );
          const fileNameKey = `${randomID}.zip`;
          const fileNameKeyReadable = `${localStorage.getItem(
            FLOY_TOKEN_KEY,
          )}-${randomID}-${zipFile?.name.slice(0, -4)}-series.zip`;

          // Rename file to be uploaded:
          Object.defineProperty(zipFile, "name", {
            writable: true,
            value: fileNameKey,
          });

          // Call Floy-API to generate signedURLs to OTC OBS:
          const response = await store?.editor.activeDocument?.floyDemo.getSignedURLs(
            `demo.floy.com-uploads/${fileNameKey}`,
            true,
            true,
          );
          const signedUploadURL = response[0];
          const signedDownloadURL = response[1];

          // Upload file to OTC OBS (demo.floy.com-uploads):
          await axios.request({
            headers: { "Content-Type": "application/zip" },
            method: "PUT",
            url: signedUploadURL,
            data: zipFile,
            onUploadProgress: (p) => {
              store?.setProgress({
                label: `Datei ${index + 1} von ${
                  zips.length
                } wird hochgeladen (${(
                  ((index + p.loaded / p.total) / zips.length) *
                  100
                ).toFixed(2)} %)`,
                progress: (index + p.loaded / p.total) / zips.length,
                showSplash: false,
              });
            },
          });

          // Call Floy-API to copy just uploaded file from 'demo.floy.com-uploads' to 'raw-data/source-0_2000-00-00/'
          await store?.editor.activeDocument?.floyDemo.copyObject(
            `demo.floy.com-uploads/${fileNameKey}`,
            `raw-data/source-0_2000-00-00/${fileNameKeyReadable}`,
          );

          signedDownloadURLs.push(signedDownloadURL);
        }

        // Calculate approximate time from upload to confirmation E-Mail:
        setApproxBulkTime((3 + zips.length * (15 / 60)).toFixed(0));
        store?.setProgress(); // Turn off ProgressBar
        setShowProgressPopUp(true);

        // Call API on Valohai after upload is finished
        await store?.editor.activeDocument?.floyDemo.runBulkInferencing(
          signedDownloadURLs,
          mail,
        );
      } catch {
        store?.setProgress();
        store?.setError({
          titleTx: "import-error",
          descriptionTx: "file-upload-error",
        });
      }

      setIsLoadingFiles(false);
    },
    [onDropCompleted, mail, store],
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
      <FloyBar useBlankScreen setMail={setMail} mail={mail} />
      {store?.progress && (
        <ProgressPopUp
          label={store.progress.label}
          labelTx={store.progress.labelTx}
          progress={store.progress.progress}
          showSplash={store.progress.showSplash}
        />
      )}
      {showProgressPopUp && (
        <FloyPopUp
          title="Upload abgeschlossen!"
          dismiss={dismissProgressPopUp}
          shouldDismissOnOutsidePress
        >
          <StyledParagraph>
            Sie erhalten in ca. {approxBulkTime} Minuten die Ergebnisse per
            E-Mail.
          </StyledParagraph>
          <PopUpButton text="Okay" onPointerDown={dismissProgressPopUp} />
        </FloyPopUp>
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
