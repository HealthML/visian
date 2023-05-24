import { ButtonParam, PopUp, TextField } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { DatasetEditPopupProps } from "./dataset-edit-popup.props";

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

const DatasetEditPopupContainer = styled(PopUp)`
  align-items: left;
  width: 400px;
`;

const TextInput = styled(TextField)`
  margin: 0px 0px 0px 0px;
  width: calc(100% - 40px);
`;

export const DatasetEditPopup = observer<DatasetEditPopupProps>(
  ({ oldName, isOpen, onClose, onConfirm }) => {
    const [name, setName] = useState(oldName);

    const clearInputsAndClose = useCallback(() => {
      setName(oldName);
      onClose?.();
    }, [onClose, oldName]);

    useEffect(() => {
      setName(oldName);
    }, [oldName]);

    return (
      <DatasetEditPopupContainer
        titleTx="edit-dataset"
        isOpen={isOpen}
        dismiss={clearInputsAndClose}
        shouldDismissOnOutsidePress
      >
        <>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholderTx="dataset-name"
          />
          <InlineRow>
            <StyledTextButton
              labelTx="cancel"
              handlePress={clearInputsAndClose}
            />
            <StyledTextButton
              labelTx="update"
              handlePress={() => {
                if (name !== "" && name !== oldName) {
                  onConfirm?.(name);
                }
                clearInputsAndClose();
              }}
            />
          </InlineRow>
        </>
      </DatasetEditPopupContainer>
    );
  },
);
