/* eslint-disable max-len */
import {
  Button,
  InvisibleButton,
  LargePopUp,
  LargePopUpGroup,
  LargePopUpGroupTitle,
  List,
  ListItem,
  Notification,
  space,
  Text,
  useFilePicker,
  useTranslation,
} from "@visian/ui-shared";
import { getBase64DataFromFile, promiseAllInBatches } from "@visian/utils";
import { AxiosError } from "axios";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { ImageImportPopUpProps } from "./image-import-popup.props";
import { imagesApi } from "../../../queries";
import { DropSheet } from "../../editor";
import { ProgressPopUp } from "../../editor/progress-popup";
import { WarningLabel } from "../warning-label";

const DropZoneContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 120px;
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
`;

const DropZoneLabel = styled(Text)`
  font-size: 14px;
  margin-right: 10px;
`;

const ExpandingLargePopUpGroup = styled(LargePopUpGroup)`
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex-grow: 1;
`;

const InfoText = styled(Text)`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
`;

const FileList = styled(List)`
  height: 100%;
  overflow-y: auto;
`;

const FileTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
`;

const FileEntry = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FileEntryText = styled(Text)`
  min-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IconButton = styled(InvisibleButton)`
  flex: 0 0 20px;
`;

const Footer = styled(LargePopUpGroup)`
  margin: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const CancelButton = styled(InvisibleButton)`
  padding: ${space("buttonPadding")};
`;

const ImportButton = styled(Button)`
  min-width: 110px;
`;

const ErrorNotification = styled(Notification)`
  position: absolute;
  min-width: 15%;
  left: 50%;
  bottom: 12%;
  transform: translateX(-50%);
`;

type SelectedFile = {
  file: File;
  hasInvalidType?: boolean;
  isDuplicate?: boolean;
};

const sanitizeForFS = (name: string) =>
  name.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();

export const ImageImportPopup = observer<ImageImportPopUpProps>(
  ({
    isOpen,
    onClose,
    dataset,
    onImportFinished,
    isDraggedOver,
    onDropCompleted,
  }) => {
    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState(0);
    const [importError, setImportError] = useState<{
      type: "generic" | "duplicate";
      imageName: string;
      totalImages: number;
    }>();
    const { t } = useTranslation();

    useEffect(() => {
      if (isOpen) setImportError(undefined);
    }, [isOpen]);

    const addSelectedFiles = useCallback(
      (files: FileList) => {
        const newFiles = Array.from(files).map((file) => {
          const isDuplicate = selectedFiles.some(
            (f) => f.file.name === file.name,
          );
          const hasInvalidType = !file.name.match(/\.(nii\.gz|dcm|nii)$/i);
          return { file, isDuplicate, hasInvalidType };
        });
        setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      },
      [selectedFiles],
    );

    const importFilesFromInput = useCallback(
      (event: Event) => {
        const { files } = event.target as HTMLInputElement;
        if (!files) return;
        addSelectedFiles(files);
      },
      [addSelectedFiles],
    );

    const importFilesFromDrop = useCallback(
      async (files: FileList) => {
        addSelectedFiles(files);
        onDropCompleted();
      },
      [addSelectedFiles, onDropCompleted],
    );

    const openFilePicker = useFilePicker(importFilesFromInput);

    const removeSelectedFile = useCallback(
      (selection: SelectedFile) =>
        setSelectedFiles((files) => files.filter((f) => f !== selection)),
      [],
    );

    const cancelImport = useCallback(() => {
      setSelectedFiles([]);
      if (onClose) onClose();
    }, [onClose]);

    const validFiles = selectedFiles.filter(
      (file) => !file.hasInvalidType && !file.isDuplicate,
    );
    const totalFiles = validFiles.length;
    const importImages = useCallback(async () => {
      if (!dataset?.id) return;
      setUploadedFiles(0);
      setIsImporting(true);
      const batchSize = 5;
      await promiseAllInBatches<SelectedFile, void>(
        async (selectedFile) => {
          try {
            const datasetName = sanitizeForFS(dataset.name);
            await imagesApi.createImage({
              createImageDto: {
                dataset: dataset.id,
                dataUri: `${datasetName}/${selectedFile.file.name}`,
                base64File: await getBase64DataFromFile(selectedFile.file),
              },
            });
            setUploadedFiles((prevUploadedFiles) => prevUploadedFiles + 1);
          } catch (error) {
            if (!(error instanceof AxiosError)) throw error;
            if (error.response?.data.message.includes("exists already")) {
              setImportError({
                type: "duplicate",
                imageName: selectedFile.file.name,
                totalImages: totalFiles,
              });
            } else {
              setImportError({
                type: "generic",
                imageName: selectedFile.file.name,
                totalImages: totalFiles,
              });
            }
            // eslint-disable-next-line no-console
            console.error(
              `Error while uploading ${selectedFile.file.name}:`,
              error,
            );
          }
        },
        validFiles,
        batchSize,
      );
      onImportFinished();
      setIsImporting(false);
      setSelectedFiles([]);
      if (onClose) onClose();
    }, [dataset, validFiles, onImportFinished, onClose, totalFiles]);

    const resetImportError = useCallback(
      () => setImportError(undefined),
      [setImportError],
    );

    if (isImporting) {
      return (
        <ProgressPopUp
          label={t("importing-images", {
            current: uploadedFiles,
            total: totalFiles,
          })}
          progress={uploadedFiles / totalFiles}
        />
      );
    }

    const errorNotification =
      importError?.type === "duplicate" ? (
        <ErrorNotification
          titleTx="image-import-error-title"
          descriptionTx="image-import-duplicate-error-description"
          descriptionData={{
            duplicateImage: importError.imageName,
            imported: uploadedFiles,
            total: importError.totalImages,
          }}
          onClose={resetImportError}
        />
      ) : importError?.type === "generic" ? (
        <ErrorNotification
          titleTx="image-import-error-title"
          descriptionTx="image-import-generic-error-description"
          descriptionData={{
            imported: uploadedFiles,
            total: importError.totalImages,
          }}
          onClose={resetImportError}
        />
      ) : undefined;

    return (
      <>
        {errorNotification}
        {isDraggedOver && (
          <DropSheet
            onDropCompleted={onDropCompleted}
            importFiles={importFilesFromDrop}
          />
        )}
        <LargePopUp
          titleTx="image-import-popup-title"
          isOpen={isOpen}
          dismiss={cancelImport}
          shouldDismissOnOutsidePress
        >
          <LargePopUpGroup>
            <DropZoneContainer>
              <DropZoneLabel text="Drop files or" />
              <ImportButton tx="Browse" onPointerDown={openFilePicker} />
            </DropZoneContainer>
          </LargePopUpGroup>
          <ExpandingLargePopUpGroup>
            <LargePopUpGroupTitle tx="import-selected-files" />
            {selectedFiles.length === 0 ? (
              <InfoText tx="import-no-files-selected" />
            ) : (
              <FileList>
                {selectedFiles.map((selection, index) => (
                  <ListItem
                    isLast={index === selectedFiles.length - 1}
                    key={index}
                  >
                    <FileEntry>
                      <FileTitleContainer>
                        <FileEntryText text={selection.file.name} />
                        {selection.isDuplicate && (
                          <WarningLabel tx="image-import-selected-is-duplicate" />
                        )}
                        {selection.hasInvalidType && (
                          <WarningLabel tx="image-import-selected-has-invalid-type" />
                        )}
                      </FileTitleContainer>
                      <IconButton
                        icon="xSmall"
                        tooltipTx="delete-dataset-title"
                        onPointerDown={() => removeSelectedFile(selection)}
                      />
                    </FileEntry>
                  </ListItem>
                ))}
              </FileList>
            )}
          </ExpandingLargePopUpGroup>
          <Footer>
            <CancelButton onPointerDown={cancelImport} tx="cancel" />
            <Button
              isDisabled={selectedFiles.length === 0}
              tx="import-images"
              onPointerDown={importImages}
            />
          </Footer>
        </LargePopUp>
      </>
    );
  },
);
