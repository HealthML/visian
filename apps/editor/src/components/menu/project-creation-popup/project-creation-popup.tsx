import { ButtonParam, PopUp, TextField } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useState, useCallback } from "react";
import styled from "styled-components";

import { ProjectCreationPopupProps } from "./project-creation-popup.props";
import { clear } from "localforage";

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

const SaveInput = styled(TextField)`
  margin: 0px 0px 0px 0px;
  width: calc(100% - 40px);
`;

export const ProjectCreationPopup = observer<ProjectCreationPopupProps>(
  ({ isOpen, onClose, onConfirm, validate }) => {
    const [name, setName] = useState("");

    const clearInputsAndClose = useCallback(() => {
      setName("");
      onClose?.();
    }, [onClose]);

    return (
      <ProjectCreationPopupContainer
        titleTx="create-project"
        isOpen={isOpen}
        dismiss={clearInputsAndClose}
        shouldDismissOnOutsidePress
      >
        <>
          <SaveInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholderTx="project-name"
          />
          <InlineRow>
            <StyledTextButton
              labelTx={"cancel"}
              handlePress={clearInputsAndClose}
            />
            <StyledTextButton
              labelTx={"create"}
              handlePress={() => {
                if (validate?.({ name })) {
                  onConfirm?.({ name });
                }
                clearInputsAndClose();
              }}
            />
          </InlineRow>
        </>
      </ProjectCreationPopupContainer>
    );
  },
);
