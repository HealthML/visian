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

const StyledText = styled(Text)`
  overflow-wrap: anywhere;
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

    return (
      <ConfirmationPopupContainer
        title={title}
        titleTx={titleTx}
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <StyledText tx={messageTx} text={message} />
        <InlineRow>
          <StyledTextButton
            label={cancel}
            labelTx={cancelTx || (cancel ? undefined : "cancel")}
            handlePress={onClose}
          />
          <StyledTextButton
            label={confirm}
            labelTx={confirmTx || (confirm ? undefined : "confirm")}
            handlePress={handleConfirmation}
          />
        </InlineRow>
      </ConfirmationPopupContainer>
    );
  },
);
