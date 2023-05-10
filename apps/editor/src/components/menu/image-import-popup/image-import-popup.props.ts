import type { StatefulPopUpProps } from "@visian/ui-shared";

import { Dataset } from "../../../types";

export interface ImageImportPopUpProps extends StatefulPopUpProps {
  dataset?: Dataset;
  onImportFinished: () => void;
}
