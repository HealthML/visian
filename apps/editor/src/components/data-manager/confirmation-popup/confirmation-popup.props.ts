import type { StatefulPopUpProps } from "@visian/ui-shared";
import { ReactNode } from "react";

export interface ConfirmationPopUpProps<T = ReactNode>
  extends StatefulPopUpProps {
  title?: string;
  titleTx?: string;
  message?: string;
  messageTx?: string;
  confirm?: string;
  confirmTx?: string;
  cancel?: string;
  cancelTx?: string;
  onConfirm?: () => void;
  children?: ReactNode;
}
