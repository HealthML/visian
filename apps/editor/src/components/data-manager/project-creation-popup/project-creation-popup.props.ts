import type { StatefulPopUpProps } from "@visian/ui-shared";

export interface ProjectCreationPopupProps extends StatefulPopUpProps {
  onConfirm?: ({ name }: { name: string }) => void;
}
