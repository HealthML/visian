import type { StatefulPopUpProps } from "@visian/ui-shared";
import { MiaDataset } from "@visian/utils";

export interface ImageImportPopUpProps extends StatefulPopUpProps {
  dataset?: MiaDataset;
  onImportFinished: () => void;
  isDraggedOver: boolean;
  onDropCompleted: () => void;
}
