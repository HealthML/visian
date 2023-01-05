import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Dataset, Image } from "../../../types";
import { DatasetImageListItem } from "./dataset-image-list-item";

const DocumentList = styled(List)`
  width: 100%;
  height: 400px;
  overflow-y: auto;
`;

export const DatasetImageList = ({
  isInSelectMode,
  dataset,
  selectedImages,
  setSelection,
}: {
  isInSelectMode: boolean;
  dataset: Dataset;
  selectedImages: Map<string, boolean>;
  setSelection: (id: string, selection: boolean) => void;
}) => (
  <DocumentList onWheel={stopPropagation}>
    {dataset.images.map((image: Image) => (
      <DatasetImageListItem
        isInSelectMode={isInSelectMode}
        image={image}
        isSelected={!!selectedImages.get(image.id)}
        toggleSelection={() =>
          setSelection(image.id, !selectedImages.get(image.id))
        }
        key={image.id}
      />
    ))}
  </DocumentList>
);
