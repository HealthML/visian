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
import { promiseAllInBatches } from "@visian/utils";
import { AxiosError } from "axios";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { postImage } from "../../../queries";
import { DropSheet } from "../../editor";
import { ProgressPopUp } from "../../editor/progress-popup";
import { ImageImportPopUpProps } from "./image-import-popup.props";

const DropZoneContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 120px;
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  /* background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='#fff' rx='8' ry='8' stroke='%23333' stroke-width='1' stroke-dasharray='10%2c 10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");*/
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

const FileEntry = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FileEntryText = styled(Text)`
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
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
        const uniqueFiles = Array.from(files).filter(
          (file) => !selectedFiles.some((f) => f.name === file.name),
        );
        setSelectedFiles((prevFiles) => [...prevFiles, ...uniqueFiles]);
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
      (file: File) =>
        setSelectedFiles((files) => files.filter((f) => f !== file)),
      [],
    );

    const cancelImport = useCallback(() => {
      setSelectedFiles([]);
      if (onClose) onClose();
    }, [onClose]);

    const totalFiles = selectedFiles.length;
    const importImages = useCallback(async () => {
      if (!dataset?.id) return;
      setUploadedFiles(0);
      setIsImporting(true);
      await promiseAllInBatches<File, void>(
        async (file) => {
          try {
            const datasetName = sanitizeForFS(dataset.name);
            await postImage(dataset.id, `${datasetName}/${file.name}`, file);
            setUploadedFiles((prevUploadedFiles) => prevUploadedFiles + 1);
          } catch (error) {
            if (!(error instanceof AxiosError)) throw error;
            if (error.response?.data.message.includes("exists already")) {
              setImportError({
                type: "duplicate",
                imageName: file.name,
                totalImages: totalFiles,
              });
            } else {
              setImportError({
                type: "generic",
                imageName: file.name,
                totalImages: totalFiles,
              });
            }
            // eslint-disable-next-line no-console
            console.error(`Error while uploading ${file.name}:`, error);
          }
        },
        selectedFiles,
        5,
      );
      onImportFinished();
      setIsImporting(false);
      setSelectedFiles([]);
      if (onClose) onClose();
    }, [dataset, selectedFiles, onImportFinished, onClose, totalFiles]);

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
          onClose={() => setImportError(undefined)}
        />
      ) : importError?.type === "generic" ? (
        <ErrorNotification
          titleTx="image-import-error-title"
          descriptionTx="image-import-generic-error-description"
          descriptionData={{
            imported: uploadedFiles,
            total: importError.totalImages,
          }}
          onClose={() => setImportError(undefined)}
        />
      ) : undefined;

    return (
      <>
        {errorNotification}
        {isDraggedOver && <DropSheet onFilesDropped={importFilesFromDrop} />}
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
                {selectedFiles.map((file, index) => (
                  <ListItem
                    isLast={index === selectedFiles.length - 1}
                    key={file.name}
                  >
                    <FileEntry>
                      <FileEntryText text={file.name} />
                      <IconButton
                        icon="xSmall"
                        tooltipTx="delete-dataset-title"
                        onPointerDown={() => removeSelectedFile(file)}
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
