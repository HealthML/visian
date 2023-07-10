import { ButtonParam, PopUp, Text } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import styled from "styled-components";

import { ConfirmationPopUpProps } from "./confirmation-popup.props";

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

const ConfirmationPopupContainer = styled(PopUp)`
  align-items: left;
  width: 400px;
`;

const StyledForm = styled.form`
  width: 100%;
`;

export const ConfirmationPopup = observer<ConfirmationPopUpProps>(
  ({
    isOpen,
    onClose,
    onConfirm,
    title,
    titleTx,
    message,
    messageTx,
    confirm,
    confirmTx,
    cancel,
    cancelTx,
  }) => {
    const handleConfirmation = useCallback(() => {
      onConfirm?.();
      onClose?.();
    }, [onClose, onConfirm]);

    const handleFormSubmit = useCallback(
      (e) => {
        e.preventDefault();
        handleConfirmation();
      },
      [handleConfirmation],
    );

    return (
      <ConfirmationPopupContainer
        title={title}
        titleTx={titleTx}
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <StyledForm onSubmit={handleFormSubmit}>
          <Text tx={messageTx} text={message} />
          <InlineRow>
            <StyledTextButton
              label={cancel}
              labelTx={cancelTx || (cancel ? undefined : "cancel")}
              handlePress={onClose}
            />
            <StyledTextButton
              autoFocus
              type="submit"
              label={confirm}
              labelTx={confirmTx || (confirm ? undefined : "confirm")}
            />
          </InlineRow>
        </StyledForm>
      </ConfirmationPopupContainer>
    );
  },
);
