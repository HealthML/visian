import { ButtonParam, PopUp, Text, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
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
    const { t } = useTranslation();

    return (
      <ConfirmationPopupContainer
        title={title}
        titleTx={titleTx}
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <>
          <Text>{message ?? t(messageTx)}</Text>
          <InlineRow>
            <StyledTextButton
              labelTx={cancel ?? cancelTx ?? "cancel"}
              handlePress={() => {
                onClose?.();
              }}
            />
            <StyledTextButton
              labelTx={confirm ?? confirmTx ?? "confirm"}
              handlePress={() => {
                onConfirm?.();
                onClose?.();
              }}
            />
          </InlineRow>
        </>
      </ConfirmationPopupContainer>
    );
  },
);
