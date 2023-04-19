import { color, FlexRow, Icon, List, ListItem, Text } from "@visian/ui-shared";
import styled from "styled-components";

import { Dataset, Image } from "../../../types";
import { useCallback, useEffect, useState } from "react";

const FileExplorer = styled(FlexRow)`
  width: 100%;
  height: 50%;
`;

const StyledList = styled(List)`
  overflow-y: auto;
`;

const StyledIcon = styled(Icon)`
  width: 2rem;
  height: 2rem;
  padding-right: 0.8rem;
`;

const StyledListItem = styled(ListItem)`
  margin-left: 3%;
  margin-right: 3%;
`;

const VerticalLine = styled.div`
  border-left: 1px solid ${color("sheetBorder")};
  margin: 0 1vw;
`;

export const ProjectDataExplorer = ({
  datasets,
  images,
  isErrorImages,
  isLoadingImages,
  selectedDataset,
  selectedImages,
  selectDataset,
  setImageSelection,
  setSelectedImages,
}: {
  datasets: Dataset[] | undefined;
  images: Image[] | undefined;
  isErrorImages: boolean;
  isLoadingImages: boolean;
  selectedDataset: string;
  selectedImages: Set<string>;
  selectDataset: (datasetId: string) => void;
  setImageSelection: (imageId: string, selection: boolean) => void;
  setSelectedImages: (selectedImages: Set<string>) => void;
}) => {
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    start: -1,
    end: -1,
  });

  const multiSelection = useCallback(
    (currentImageIndex: number, isDeselection: boolean) => {
      const selectedRangeEnd =
        selectedRange.end !== -1 ? selectedRange.end : currentImageIndex;
      const startIndex = Math.min(selectedRangeEnd, currentImageIndex);
      const endIndex = Math.max(selectedRangeEnd, currentImageIndex);

      const updatedSelectedImages = new Set(selectedImages);

      images?.forEach((image, index) => {
        if (index >= startIndex && index <= endIndex) {
          isDeselection
            ? updatedSelectedImages.delete(image.id)
            : updatedSelectedImages.add(image.id);
        } else if (selectedImages.has(image.id)) {
          updatedSelectedImages.add(image.id);
        }
      });

      setSelectedImages(updatedSelectedImages);
      setSelectedRange({ start: selectedRange.end, end: currentImageIndex });
    },
    [images, selectedImages, selectedRange, setSelectedImages],
  );

  const handlePointerDown = useCallback(
    (imageId: string, index: number) => {
      const isSelected = selectedImages.has(imageId);
      if (isShiftPressed) {
        multiSelection(index, isSelected);
      } else {
        setSelectedRange({ start: index, end: index });
        setImageSelection(imageId, !isSelected);
      }
    },
    [isShiftPressed, multiSelection, setImageSelection, selectedImages],
  );

  return (
    <FileExplorer>
      {datasets && (
        <StyledList>
          {datasets.map((dataset) => (
            <StyledListItem
              key={dataset.id}
              isLast
              isActive={dataset.id === selectedDataset}
              onPointerDown={() => selectDataset(dataset.id)}
            >
              <StyledIcon icon="folder" />
              <Text>{dataset.name}</Text>
            </StyledListItem>
          ))}
        </StyledList>
      )}
      <VerticalLine />
      {datasets && (
        <StyledList>
          {selectedDataset && isLoadingImages && <Text tx="images-loading" />}
          {selectedDataset && isErrorImages && (
            <Text tx="images-loading-error" />
          )}
          {images &&
            !isErrorImages &&
            !isLoadingImages &&
            images.map((image, index) => (
              <StyledListItem
                key={image.id}
                isLast
                isActive={selectedImages.has(image.id)}
                onPointerDown={() => handlePointerDown(image.id, index)}
                onKeyDown={(event) => setIsShiftPressed(event.shiftKey)}
                onKeyUp={() => setIsShiftPressed(false)}
                tabIndex={0}
              >
                <StyledIcon icon="document" />
                <Text>{image.dataUri}</Text>
              </StyledListItem>
            ))}
        </StyledList>
      )}
    </FileExplorer>
  );
};
