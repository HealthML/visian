import type { StatefulPopUpProps } from "@visian/ui-shared";

import { Dataset, Image } from "../../../types";

export interface ProjectDataExplorerProps extends StatefulPopUpProps {
  datasets?: Dataset[];
  images?: Image[];
  isErrorImages: boolean;
  isLoadingImages: boolean;
  selectedDataset?: string;
  selectedImages: Set<string>;
  selectDataset: (datasetId: string) => void;
  setImageSelection: (imageId: string, selection: boolean) => void;
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
}
