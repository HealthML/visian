import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Image } from "../../../types";
import { DatasetImageListItem } from "./dataset-image-list-item";
import { useKeyboardShortcuts } from "../util";

const ImageList = styled(List)`
  width: 100%;
  height: 400px;
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
}: {
  isInSelectMode: boolean;
  images: Image[];
  refetchImages: () => void;
  selectedImages: Set<string>;
  setImageSelection: (imageId: string, isSelected: boolean) => void;
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
}) => {
  const { isShiftPressed, selectedRange, setSelectedRange } =
    useKeyboardShortcuts({ selectedImages, setSelectedImages, images });

  return (
    <ImageList onWheel={stopPropagation}>
      {images.map((image: Image, index: number) => (
        <DatasetImageListItem
          key={image.id}
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
        />
      ))}
    </ImageList>
  );
};
