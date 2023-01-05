import { Modal } from "@visian/ui-shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { Dataset } from "../../../types";
import { DatasetImageList } from "../dataset-image-list";
import { DatasetNavigationbar } from "../dataset-navigationbar";

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
`;

export const DatasetModal = ({ dataset }: { dataset: Dataset }) => {
  const [isInSelectMode, setIsInSelectMode] = useState(false);

  const [selectedImages, setSelectedImages] = useState<Map<string, boolean>>(
    new Map(dataset.images.map((image) => [image.id, false])),
  );

  // sync dataset with datasetProps and update selectCount
  useEffect(() => {
    setSelectedImages((previousSelectedImages) => {
      const newSelectedImages = new Map(
        dataset.images.map((image) => [image.id, false]),
      );
      previousSelectedImages.forEach((value, key) => {
        if (newSelectedImages.has(key)) newSelectedImages.set(key, value);
      });
      return newSelectedImages;
    });
  }, [dataset]);

  const setSelection = useCallback((id: string, selection: boolean) => {
    setSelectedImages((prevSelectedImages) => {
      prevSelectedImages.set(id, selection);
      return new Map(prevSelectedImages);
    });
  }, []);

  const setSelectAll = useCallback((selection: boolean) => {
    setSelectedImages((prevSelectedImages) => {
      prevSelectedImages.forEach((value, key) =>
        prevSelectedImages.set(key, selection),
      );
      return new Map(prevSelectedImages);
    });
  }, []);

  const toggleSelectMode = useCallback(() => {
    setIsInSelectMode((prevIsInSelectMode) => !prevIsInSelectMode);
  }, []);

  const areAllSelected = useMemo(
    () => [...selectedImages.values()].every((value) => value),
    [selectedImages],
  );

  const toggleSelectAll = useCallback(
    () => setSelectAll(!areAllSelected),
    [areAllSelected, setSelectAll],
  );

  return (
    <StyledModal
      hideHeaderDivider={false}
      label={dataset.name}
      position="right"
      headerChildren={
        <DatasetNavigationbar
          isInSelectMode={isInSelectMode}
          allSelected={areAllSelected}
          toggleSelectMode={toggleSelectMode}
          toggleSelectAll={toggleSelectAll}
        />
      }
    >
      <DatasetImageList
        isInSelectMode={isInSelectMode}
        dataset={dataset}
        selectedImages={selectedImages}
        setSelection={setSelection}
      />
    </StyledModal>
  );
};
