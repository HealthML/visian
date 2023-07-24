import { ButtonParam, PopUp, TextField } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";
import styled from "styled-components";

import { ProjectCreationPopupProps } from "./project-creation-popup.props";

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

const ProjectCreationPopupContainer = styled(PopUp)`
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

export const ProjectCreationPopup = observer<ProjectCreationPopupProps>(
  ({ isOpen, onClose, onConfirm }) => {
    const [name, setName] = useState("");
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

    const clearInputsAndClose = useCallback(() => {
      setName("");
      onClose?.();
    }, [onClose]);

    const updateName = useCallback(
      (e) => {
        setName(e.target.value);
        setIsSubmitDisabled(false);
      },
      [setName],
    );

    const handleCreation = useCallback(() => {
      if (name !== "") {
        onConfirm?.(name);
      }
      clearInputsAndClose();
    }, [name, onConfirm, clearInputsAndClose]);

    const handleFormSubmit = useCallback(
      (e) => {
        e.preventDefault();
        if (!isSubmitDisabled) handleCreation();
      },
      [handleCreation, isSubmitDisabled],
    );

    return (
      <ProjectCreationPopupContainer
        titleTx="create-project"
        isOpen={isOpen}
        dismiss={clearInputsAndClose}
        shouldDismissOnOutsidePress
      >
        <StyledForm onSubmit={handleFormSubmit}>
          <TextInput
            autoFocus
            value={name}
            onChange={updateName}
            placeholderTx="project-name"
          />
          <InlineRow>
            <StyledTextButton
              labelTx="cancel"
              handlePress={clearInputsAndClose}
            />
            <StyledTextButton
              type="submit"
              labelTx="create"
              isDisabled={isSubmitDisabled}
            />
          </InlineRow>
        </StyledForm>
      </ProjectCreationPopupContainer>
    );
  },
);
