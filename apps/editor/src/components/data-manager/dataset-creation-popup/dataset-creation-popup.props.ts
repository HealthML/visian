import type { StatefulPopUpProps } from "@visian/ui-shared";

export interface DatasetCreationPopupProps extends StatefulPopUpProps {
  onConfirm?: ({ name }: { name: string }) => void;
}
