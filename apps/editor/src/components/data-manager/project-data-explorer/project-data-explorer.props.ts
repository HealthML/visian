import { Dataset, Image } from "@visian/mia-api";
import type { StatefulPopUpProps } from "@visian/ui-shared";

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
