import { color, FlexRow, Icon, List, ListItem, Text } from "@visian/ui-shared";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { Dataset, Image } from "../../../types";
import { handleImageSelection } from "../util";

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
  user-select: none;
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
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
}) => {
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    start: -1,
    end: -1,
  });

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
                onPointerDown={() =>
                  handleImageSelection(
                    image.id,
                    index,
                    selectedImages,
                    isShiftPressed,
                    selectedRange,
                    setSelectedRange,
                    images,
                    setImageSelection,
                    setSelectedImages,
                  )
                }
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
