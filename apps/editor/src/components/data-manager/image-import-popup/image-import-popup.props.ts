import type { MiaDataset, StatefulPopUpProps } from "@visian/ui-shared";

export interface ImageImportPopUpProps extends StatefulPopUpProps {
  dataset?: MiaDataset;
  onImportFinished: () => void;
  isDraggedOver: boolean;
  onDropCompleted: () => void;
}
