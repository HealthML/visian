import { ButtonParam, PopUp, TextField } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";
import styled from "styled-components";

import { DatasetCreationPopupProps } from "./dataset-creation-popup.props";

const StyledTextButton = styled(ButtonParam)`
  margin: 0px;
  width: auto;
`;

const InlineRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  margin-top: 30px;
`;

const DatasetCreationPopupContainer = styled(PopUp)`
  align-items: left;
  width: 400px;
`;

const TextInput = styled(TextField)`
  margin: 0px 0px 0px 0px;
  width: calc(100% - 40px);
`;

export const DatasetCreationPopup = observer<DatasetCreationPopupProps>(
  ({ isOpen, onClose, onConfirm }) => {
    const [name, setName] = useState("");

    const clearInputsAndClose = useCallback(() => {
      setName("");
      onClose?.();
    }, [onClose]);

    const handleCreation = useCallback(() => {
      if (name !== "") {
        onConfirm?.({ name });
      }
      clearInputsAndClose();
    }, [name, onConfirm, clearInputsAndClose]);

    const updateName = useCallback((e) => setName(e.target.value), [setName]);

    return (
      <DatasetCreationPopupContainer
        titleTx="create-dataset"
        isOpen={isOpen}
        dismiss={clearInputsAndClose}
        shouldDismissOnOutsidePress
      >
        <TextInput
          value={name}
          onChange={updateName}
          placeholderTx="dataset-name"
        />
        <InlineRow>
          <StyledTextButton
            labelTx="cancel"
            handlePress={clearInputsAndClose}
          />
          <StyledTextButton labelTx="create" handlePress={handleCreation} />
        </InlineRow>
      </DatasetCreationPopupContainer>
    );
  },
);
