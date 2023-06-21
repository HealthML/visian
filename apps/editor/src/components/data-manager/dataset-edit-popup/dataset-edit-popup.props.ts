import type { StatefulPopUpProps } from "@visian/ui-shared";

export interface DatasetEditPopupProps extends StatefulPopUpProps {
  oldName: string;
  onConfirm?: (name: string) => void;
}
