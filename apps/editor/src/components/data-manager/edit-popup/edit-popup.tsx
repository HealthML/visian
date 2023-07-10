import { ButtonParam, PopUp, TextField } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { EditPopupProps } from "./edit-popup.props";

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

const EditPopupContainer = styled(PopUp)`
  align-items: left;
  width: 400px;
`;

const TextInput = styled(TextField)`
  margin: auto;
  width: 100%;
`;

const StyledForm = styled.form`
  width: 100%;
`;

export const EditPopup = observer<EditPopupProps>(
  ({ oldName, isOpen, onClose, onConfirm }) => {
    const [name, setName] = useState(oldName);

    const clearInputsAndClose = useCallback(() => {
      setName(oldName);
      onClose?.();
    }, [onClose, oldName]);

    useEffect(() => {
      setName(oldName);
    }, [oldName]);

    const handleEdit = useCallback(() => {
      if (name !== "" && name !== oldName) {
        onConfirm?.(name);
      }
      clearInputsAndClose();
    }, [name, oldName, clearInputsAndClose, onConfirm]);

    const updateName = useCallback((e) => setName(e.target.value), [setName]);

    const handleFormSubmit = useCallback(
      (e) => {
        e.preventDefault();
        handleEdit();
      },
      [handleEdit],
    );

    return (
      <EditPopupContainer
        titleTx="edit"
        isOpen={isOpen}
        dismiss={clearInputsAndClose}
        shouldDismissOnOutsidePress
      >
        <StyledForm onSubmit={handleFormSubmit}>
          <TextInput
            autoFocus
            value={name}
            onChange={updateName}
            placeholderTx="name"
          />
          <InlineRow>
            <StyledTextButton
              labelTx="cancel"
              handlePress={clearInputsAndClose}
            />
            <StyledTextButton type="submit" labelTx="update" />
          </InlineRow>
        </StyledForm>
      </EditPopupContainer>
    );
  },
);
