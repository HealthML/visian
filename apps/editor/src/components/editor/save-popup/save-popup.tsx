/* eslint-disable max-len */
import { Button, PopUp, Text, TextField } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { SavePopUpProps } from "./save-popup.props";

const SectionLabel = styled(Text)`
  font-size: 14px;
  margin-bottom: 8px;
`;

const SaveInput = styled(TextField)`
  margin: 0px 10px 0px 0px;
  width: 100%;
`;

const SaveButton = styled(Button)`
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

const SavePopUpContainer = styled(PopUp)`
  align-items: left;
  width: 500px;
`;

export const SavePopUp = observer<SavePopUpProps>(({ isOpen, onClose }) => {
  const store = useStore();
  const [newAnnotationURI, setnewAnnotationURI] = useState("");

  const saveAnnotation = () => {
    console.log("saved annotation");
  };

  return (
    <SavePopUpContainer
      title="Save Annotation Layer"
      isOpen={isOpen}
      dismiss={onClose}
      shouldDismissOnOutsidePress
    >
      {store?.editor.activeDocument?.activeLayer?.metaDataId && (
        <>
          <SectionLabel text="Overwrite existing annotation file" />
          <InlineRow>
            <SaveInput
              placeholder="URI"
              value={store?.editor.activeDocument?.activeLayer?.metaDataId}
              readOnly
            />
            <SaveButton tx="Save" onPointerDown={saveAnnotation} />
          </InlineRow>
        </>
      )}
      <SectionLabel text="Create new annotation file" />
      <InlineRowLast>
        <SaveInput
          placeholder="URI"
          value={newAnnotationURI}
          onChangeText={setnewAnnotationURI}
        />
        <SaveButton tx="Save As" onPointerDown={saveAnnotation} />
      </InlineRowLast>
    </SavePopUpContainer>
  );
});
