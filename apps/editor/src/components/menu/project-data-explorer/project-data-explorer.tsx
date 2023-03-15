import {
  Box,
  color,
  FlexColumn,
  FlexRow,
  Icon,
  List,
  ListItem,
  Button,
  Text,
} from "@visian/ui-shared";
import styled from "styled-components";
import { Image } from "../../../types";

import useDatasetsBy from "apps/editor/src/queries/use-datasets-by";
import { useDataset, useImagesBy } from "apps/editor/src/queries";
import { useCallback, useEffect, useMemo, useState } from "react";

const Main = styled(FlexRow)`
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

const FileExplorer = styled(FlexColumn)`
  width: 100%;
  height: 100%;
`;

const BottomNavigationBar = styled(Box)`
  display: flex;
  justify-content: center;
  margin-top: 10%;
`;

export const ProjectDataExplorer = ({
  projectId,
  createAutoAnnotationJob,
  activeImageSelection,
  openWithDatasetId: openWithDatasetId,
}: {
  projectId: string;
  createAutoAnnotationJob: (imageSelection: string[]) => Promise<void>;
  activeImageSelection: string[] | undefined;
  openWithDatasetId: string | undefined;
}) => {
  // TODO integrate Query Errors
  const { datasets, datasetsError, isErrorDatasets, isLoadingDatasets } =
    useDatasetsBy(projectId);

  const [selectedDataset, setSelectedDataset] = useState(
    (datasets &&
      openWithDatasetId &&
      datasets.filter((dataset) => dataset.id === openWithDatasetId)[0].id) ||
      "",
  );

  const { images, imagesError, isErrorImages, isLoadingImages, refetchImages } =
    useImagesBy(selectedDataset);

  const selectDataset = useCallback(
    (datasetId) => {
      // saveImageSelection(selectedDataset);
      setSelectedDataset(datasetId);
    },
    [selectedDataset],
  );

  const [selectedImages, setSelectedImages] = useState<
    Map<string, Map<string, boolean>>
  >(
    (openWithDatasetId &&
      activeImageSelection &&
      new Map<string, Map<string, boolean>>([
        [
          openWithDatasetId,
          new Map<string, boolean>(
            (activeImageSelection ?? []).map((image: string) => [image, true]),
          ),
        ],
      ])) ||
      new Map(),
  );

  const setImageSelection = useCallback(
    (datasetId: string, imageId: string, selection: boolean) => {
      setSelectedImages((prevSelectedImages) => {
        if (selection) {
          prevSelectedImages.get(datasetId)?.set(imageId, selection);
        } else {
          prevSelectedImages.get(datasetId)?.delete(imageId);
        }
        prevSelectedImages.set(
          datasetId,
          prevSelectedImages.get(datasetId) || new Map(),
        );
        return new Map(prevSelectedImages);
      });
    },
    [],
  );

  const imageSelectionForJob = useCallback(() => {
    const selectionForJob = Array.from(selectedImages.values()).flatMap(
      (imageMaps) => Array.from(imageMaps.keys()),
    );
    return createAutoAnnotationJob(selectionForJob);
  }, [createAutoAnnotationJob, selectedImages]);

  return (
    <FileExplorer>
      <Main>
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
      </Main>
      <BottomNavigationBar>
        <Button text="Start Job" onPointerDown={imageSelectionForJob} />
      </BottomNavigationBar>
    </FileExplorer>
  );
};
