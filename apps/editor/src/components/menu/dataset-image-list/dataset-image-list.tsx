import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Annotation, Image } from "../../../types";
import { DatasetImageListItem } from "./dataset-image-list-item";

const ImageList = styled(List)`
  width: 100%;
  height: 400px;
  overflow-y: auto;
`;

export const DatasetImageList = ({
  isInSelectMode,
  images,
  refetchImages,
  selectedImages,
  setSelection,
  deleteAnnotation,
}: {
  isInSelectMode: boolean;
  images: Image[];
  refetchImages: () => void;
  selectedImages: Map<string, boolean>;
  setSelection: (id: string, selection: boolean) => void;
  deleteAnnotation: (annotation: Annotation) => void;
}) => (
  <ImageList onWheel={stopPropagation}>
    {images.map((image: Image) => (
      <DatasetImageListItem
        isInSelectMode={isInSelectMode}
        image={image}
        refetchImages={refetchImages}
        isSelected={!!selectedImages.get(image.id)}
        toggleSelection={() =>
          setSelection(image.id, !selectedImages.get(image.id))
        }
        deleteAnnotation={deleteAnnotation}
        key={image.id}
      />
    ))}
  </ImageList>
);
