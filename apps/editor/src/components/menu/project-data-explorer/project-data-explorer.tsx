import { color, FlexRow, Icon, List, ListItem, Text } from "@visian/ui-shared";
import styled, { css } from "styled-components";

import { Dataset, Image } from "../../../types";

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

export const ProjectDataExplorer = ({
  datasets,
  images,
  isErrorImages,
  isLoadingImages,
  selectedDataset,
  selectedImages,
  selectDataset,
  setImageSelection,
}: {
  datasets: Dataset[] | undefined;
  images: Image[] | undefined;
  isErrorImages: boolean;
  isLoadingImages: boolean;
  selectedDataset?: string;
  selectedImages: Set<string>;
  selectDataset: (datasetId: string) => void;
  setImageSelection: (imageId: string, selection: boolean) => void;
}) => (
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
        {selectedDataset && isErrorImages && <Text tx="images-loading-error" />}
        {images &&
          !isErrorImages &&
          !isLoadingImages &&
          images.map((image) => (
            <StyledListItem
              key={image.id}
              isLast
              isActive={selectedImages.has(image.id)}
              onPointerDown={() =>
                setImageSelection(image.id, !selectedImages.has(image.id))
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
