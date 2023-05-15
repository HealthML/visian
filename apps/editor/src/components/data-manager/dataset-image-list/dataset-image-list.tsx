import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Annotation, Image } from "../../../types";
import { useKeyboardShortcuts } from "../util";
import { DatasetImageListItem } from "./dataset-image-list-item";

const ImageList = styled(List)`
  overflow-y: auto;
  user-select: none;
`;

export const DatasetImageList = ({
  isInSelectMode,
  images,
  refetchImages,
  selectedImages,
  setImageSelection,
  setSelectedImages,
  deleteAnnotation,
  deleteImage,
}: {
  isInSelectMode: boolean;
  images: Image[];
  refetchImages: () => void;
  selectedImages: Set<string>;
  setImageSelection: (imageId: string, isSelected: boolean) => void;
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
  deleteAnnotation: (annotation: Annotation) => void;
  deleteImage: (image: Image) => void;
}) => {
  const { isShiftPressed, selectedRange, setSelectedRange } =
    useKeyboardShortcuts({ selectedImages, setSelectedImages, images });

  return (
    <ImageList onWheel={stopPropagation}>
      {images.map((image: Image, index: number) => (
        <DatasetImageListItem
          key={image.id}
          isLast={index === images.length - 1}
          isInSelectMode={isInSelectMode}
          image={image}
          refetchImages={refetchImages}
          isSelected={!!selectedImages.has(image.id)}
          index={index}
          selectedImages={selectedImages}
          images={images}
          setImageSelection={setImageSelection}
          setSelectedImages={setSelectedImages}
          isShiftPressed={isShiftPressed}
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
          deleteAnnotation={deleteAnnotation}
          deleteImage={deleteImage}
        />
      ))}
    </ImageList>
  );
};
