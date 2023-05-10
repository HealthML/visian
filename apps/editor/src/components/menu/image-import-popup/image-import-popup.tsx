import {
  Button,
  InvisibleButton,
  LargePopUp,
  LargePopUpGroup,
  LargePopUpGroupTitle,
  List,
  ListItem,
  space,
  Text,
  useFilePicker,
  useTranslation,
} from "@visian/ui-shared";
import { promiseAllInBatches } from "@visian/utils";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";
import styled from "styled-components";

import { postImage } from "../../../queries";
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

const sanitizeForFS = (name: string) =>
  name.replace(/[^a-z0-9_\-]/gi, "_").toLowerCase();

export const ImageImportPopup = observer<ImageImportPopUpProps>(
  ({ isOpen, onClose, dataset, onImportFinished }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState(0);
    const { t } = useTranslation();

    const importFilesFromInput = useCallback((event: Event) => {
      const { files } = event.target as HTMLInputElement;
      if (!files) return;
      setSelectedFiles(Array.from(files));
    }, []);

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
          const datasetName = sanitizeForFS(dataset.name);
          await postImage(dataset.id, `${datasetName}/${file.name}`, file);
          setUploadedFiles((prevUploadedFiles) => prevUploadedFiles + 1);
        },
        selectedFiles,
        5,
      );
      onImportFinished();
      setIsImporting(false);
      setSelectedFiles([]);
      if (onClose) onClose();
    }, [selectedFiles, dataset, onClose, onImportFinished]);

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

    return (
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
    );
  },
);
