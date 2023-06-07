import type { StatefulPopUpProps } from "@visian/ui-shared";

export interface ConfirmationPopUpProps extends StatefulPopUpProps {
  title?: string;
  titleTx?: string;
  message?: string;
  confirm?: string;
  confirmTx?: string;
  cancel?: string;
  cancelTx?: string;
  onConfirm?: () => void;
}
