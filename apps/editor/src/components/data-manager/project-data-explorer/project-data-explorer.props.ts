import type {
  MiaDataset,
  MiaImage,
  StatefulPopUpProps,
} from "@visian/ui-shared";

export interface ProjectDataExplorerProps extends StatefulPopUpProps {
  datasets?: MiaDataset[];
  images?: MiaImage[];
  isErrorImages: boolean;
  isLoadingImages: boolean;
  selectedDataset?: string;
  selectedImages: Set<string>;
  selectDataset: (datasetId: string) => void;
  setImageSelection: (imageId: string, selection: boolean) => void;
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
}
