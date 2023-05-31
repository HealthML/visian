import { color, FlexRow, Icon, List, ListItem, Text } from "@visian/ui-shared";
import styled, { css } from "styled-components";

import { handleImageSelection, useKeyboardShortcuts } from "../util";
import { ProjectDataExplorerProps } from "./project-data-explorer.props";

const FileExplorer = styled(FlexRow)`
  width: 100%;
  overflow-y: hidden;
`;

const StyledList = styled(List)`
  overflow-y: auto;
`;

const StyledIcon = styled(Icon)`
  width: 2rem;
  height: 2rem;
  padding-right: 0.8rem;
`;

const StyledListItem = styled(ListItem)<{ isActive?: boolean }>`
  user-select: none;
  // Fix too thick line on intersection between active items
  margin: 1px 3%;
  // Fix items moving by 1px on selection / deselection
  ${(props) =>
    !props.isActive &&
    css`
      padding: 1px 0;
    `}
`;

const VerticalLine = styled.div`
  border-left: 1px solid ${color("sheetBorder")};
  margin: 0 1vw;
`;

export const ProjectDataExplorer: React.FC<ProjectDataExplorerProps> = ({
  datasets,
  images,
  isErrorImages,
  isLoadingImages,
  selectedDataset,
  selectedImages,
  selectDataset,
  setImageSelection,
  setSelectedImages,
}) => {
  const { isShiftPressed, selectedRange, setSelectedRange } =
    useKeyboardShortcuts({ selectedImages, setSelectedImages, images });

  function extractTitleFromDataUri(dataUri: string) {
    return dataUri.split("/").pop(); // Extract the last element of the array
  }

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
                <Text>{extractTitleFromDataUri(image.dataUri)}</Text>
              </StyledListItem>
            ))}
        </StyledList>
      )}
    </FileExplorer>
  );
};
