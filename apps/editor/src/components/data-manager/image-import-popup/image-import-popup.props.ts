import { Dataset } from "@visian/mia-api";
import type { StatefulPopUpProps } from "@visian/ui-shared";

export interface ImageImportPopUpProps extends StatefulPopUpProps {
  dataset?: Dataset;
  onImportFinished: () => void;
  isDraggedOver: boolean;
  onDropCompleted: () => void;
}
