import { color, FlexRow, Icon, List, ListItem, Text } from "@visian/ui-shared";
import styled from "styled-components";
import { Dataset, Image } from "../../../types";

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

const VerticalLine = styled.div`
  border-left: 1px solid ${color("sheetBorder")};
  margin: 0 1vw;
`;

export const ProjectDataExplorer = ({
  datasets,
  images,
  selectedDataset,
  selectedImages,
  selectDataset,
  setImageSelection,
}: {
  datasets: Dataset[] | undefined;
  images: Image[] | undefined;
  selectedDataset: string;
  selectedImages: Map<string, Map<string, boolean>>;
  selectDataset: (datasetId: string) => void;
  setImageSelection: (
    datasetId: string,
    imageId: string,
    selection: boolean,
  ) => void;
}) => (
  <FileExplorer>
    {datasets && (
      <StyledList>
        {datasets.map((dataset) => (
          <ListItem
            key={dataset.id}
            isLast
            isActive={dataset.id === selectedDataset}
            onPointerDown={() => selectDataset(dataset.id)}
          >
            <StyledIcon icon="folder" />
            <Text>{dataset.name}</Text>
          </ListItem>
        ))}
      </StyledList>
    )}
    <VerticalLine />
    {datasets && (
      <StyledList>
        {images &&
          images.map((image) => (
            <ListItem
              key={image.id}
              isLast
              isActive={selectedImages.get(image.dataset)?.has(image.id)}
              onPointerDown={() =>
                setImageSelection(
                  image.dataset,
                  image.id,
                  !selectedImages.get(image.dataset)?.get(image.id),
                )
              }
            >
              <StyledIcon icon="document" />
              <Text>{image.dataUri}</Text>
            </ListItem>
          ))}
      </StyledList>
    )}
  </FileExplorer>
);
