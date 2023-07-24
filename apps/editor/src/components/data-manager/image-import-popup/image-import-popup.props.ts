import { MiaDataset } from "@visian/utils";
import type { StatefulPopUpProps } from "@visian/ui-shared";

export interface ImageImportPopUpProps extends StatefulPopUpProps {
  dataset?: MiaDataset;
  onImportFinished: () => void;
  isDraggedOver: boolean;
  onDropCompleted: () => void;
}
