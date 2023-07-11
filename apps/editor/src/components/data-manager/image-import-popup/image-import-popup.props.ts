import type { StatefulPopUpProps } from "@visian/ui-shared";

import { Dataset } from "mia-api-client";

export interface ImageImportPopUpProps extends StatefulPopUpProps {
  dataset?: Dataset;
  onImportFinished: () => void;
  isDraggedOver: boolean;
  onDropCompleted: () => void;
}
