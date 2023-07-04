import type { StatefulPopUpProps } from "@visian/ui-shared";

export interface EditPopupProps extends StatefulPopUpProps {
  oldName: string;
  onConfirm?: (name: string) => void;
}
