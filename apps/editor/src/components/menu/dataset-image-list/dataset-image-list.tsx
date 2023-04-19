import { List, stopPropagation } from "@visian/ui-shared";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { Image } from "../../../types";
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
  // setSelection,
  setImageSelection,
  setSelectedImages,
}: {
  isInSelectMode: boolean;
  images: Image[];
  refetchImages: () => void;
  // selectedImages: Map<string, boolean>;
  selectedImages: Set<string>;
  // setSelection: (id: string, selection: boolean) => void;
  setImageSelection: (imageId: string, isSelected: boolean) => void;
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
}) => {
  const [selectedRange, setSelectedRange] = useState({
    start: -1,
    end: -1,
  });
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = () => {
      setIsShiftPressed(true);
    };

    const handleKeyUp = () => {
      setIsShiftPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => console.log(isShiftPressed), [isShiftPressed]);
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
          setIsShiftPressed={setIsShiftPressed}
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
        />
      ))}
    </ImageList>
  );
};
