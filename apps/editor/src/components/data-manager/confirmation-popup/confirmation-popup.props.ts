import type { I18nData, StatefulPopUpProps } from "@visian/ui-shared";

export interface ConfirmationPopUpProps extends StatefulPopUpProps {
  title?: string;
  titleTx?: string;
  message?: string;
  messageTx?: string;
  messageData?: I18nData;
  confirm?: string;
  confirmTx?: string;
  cancel?: string;
  cancelTx?: string;
  onConfirm?: () => void;
}
