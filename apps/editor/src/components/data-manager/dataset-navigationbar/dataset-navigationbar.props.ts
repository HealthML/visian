import type { StatefulPopUpProps } from "@visian/ui-shared";

export interface DatasetNavigationbarProps extends StatefulPopUpProps {
  isInSelectMode: boolean;
  allSelected: boolean;
  anySelected: boolean;
  toggleSelectMode: () => void;
  toggleSelectAll: () => void;
  openJobCreationPopUp: () => void;
  openImageImportPopUp: () => void;
  deleteSelectedImages: () => void;
}
