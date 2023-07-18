/* eslint-disable max-len */
import {
  Button,
  PopUp,
  Serverity,
  Text,
  TextField,
  useFilePicker,
} from "@visian/ui-shared";
import { readFileFromURL } from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { importFilesToDocument } from "../../../import-handling";
import { ImportPopUpProps } from "./import-popup.props";

const SectionLabel = styled(Text)`
  font-size: 14px;
  margin-bottom: 8px;
`;

const ImportInput = styled(TextField)`
  margin: 0px 10px 0px 0px;
  width: 100%;
`;

const ImportButton = styled(Button)`
  min-width: 110px;
`;

const InlineRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 28px;
`;

const InlineRowLast = styled(InlineRow)`
  margin-bottom: 10px;
`;

const DropZoneContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 120px;
  margin-bottom: 28px;
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  /* background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='#fff' rx='8' ry='8' stroke='%23333' stroke-width='1' stroke-dasharray='10%2c 10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");*/
`;

const DropZoneLabel = styled(Text)`
  font-size: 14px;
  margin-right: 10px;
`;

const ImportPopUpContainer = styled(PopUp)`
  align-items: left;
  width: 400px;
`;

export const ImportPopUp = observer<ImportPopUpProps>(({ isOpen, onClose }) => {
  const store = useStore();

  const importFilesFromInput = useCallback(
    (event: Event) => {
      const { files } = event.target as HTMLInputElement;
      if (!files || !store) return;
      importFilesToDocument(files, store, true, onClose);
    },
    [store, onClose],
  );

  // Local import
  const openFilePicker = useFilePicker(importFilesFromInput);

  // Load from URL
  const [loadURL, setLoadURL] = useState("");
  const loadFromURL = useCallback(async () => {
    if (!loadURL) return;

    try {
      await store?.editor.activeDocument?.importFiles(
        await readFileFromURL(loadURL, true),
      );
      store?.editor.activeDocument?.finishBatchImport();
      onClose?.();
    } catch {
      store?.setError({
        serverity: Serverity.error,
        titleTx: "import-error",
        descriptionTx: "remote-file-error",
      });
    }
  }, [loadURL, store, onClose]);

  // Connect to server
  const [serverURL, setServerURL] = useState("");
  const connectToServer = useCallback(async () => {
    if (!serverURL) return;

    try {
      await store?.connectToDICOMWebServer(serverURL);
    } catch {
      store?.setError({
        serverity: Serverity.error,
        titleTx: "import-error",
        descriptionTx: "remote-file-error",
      });
    }
  }, [serverURL, store]);

  return (
    <ImportPopUpContainer
      title="Import"
      isOpen={isOpen}
      dismiss={onClose}
      shouldDismissOnOutsidePress
    >
      <SectionLabel tx="computer-upload" />
      <DropZoneContainer>
        <DropZoneLabel tx="drop-files-or" />
        <ImportButton tx="Browse" onPointerDown={openFilePicker} />
      </DropZoneContainer>
      <SectionLabel tx="Load from URL" />
      <InlineRow>
        <ImportInput
          placeholder="https://..."
          value={loadURL}
          onChangeText={setLoadURL}
        />
        <ImportButton tx="Load" onPointerDown={loadFromURL} />
      </InlineRow>
      <SectionLabel tx="connect-to-server" />
      <InlineRowLast>
        <ImportInput
          placeholder="https://..."
          value={serverURL}
          onChangeText={setServerURL}
        />
        <ImportButton tx="Connect" onPointerDown={connectToServer} />
      </InlineRowLast>
    </ImportPopUpContainer>
  );
});
