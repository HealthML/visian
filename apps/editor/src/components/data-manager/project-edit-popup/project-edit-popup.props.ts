import type { StatefulPopUpProps } from "@visian/ui-shared";

export interface ProjectEditPopupProps extends StatefulPopUpProps {
  oldName: string;
  onConfirm?: (name: string) => void;
}
