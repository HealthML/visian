import { Modal, Text, useTranslation } from "@visian/ui-shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { useImagesByDataset } from "../../../queries";
import { Dataset } from "../../../types";
import { DatasetImageList } from "../dataset-image-list";
import { DatasetNavigationbar } from "../dataset-navigationbar";
import { JobCreationPopup } from "../job-creation-popup";

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
  z-index: 49;
`;
// TODO: z-index logic

export const DatasetExplorer = ({ dataset }: { dataset: Dataset }) => {
  const [isInSelectMode, setIsInSelectMode] = useState(false);

  const { images, imagesError, isErrorImages, isLoadingImages, refetchImages } =
    useImagesByDataset(dataset.id);

  const [selectedImages, setSelectedImages] = useState<Map<string, boolean>>(
    new Map((images ?? []).map((image) => [image.id, false])),
  );

  // sync selectedImages and images array
  useEffect(() => {
    setSelectedImages((previousSelectedImages) => {
      const newSelectedImages = new Map(
        (images ?? []).map((image) => [image.id, false]),
      );
      previousSelectedImages.forEach((value, key) => {
        if (newSelectedImages.has(key)) newSelectedImages.set(key, value);
      });
      return newSelectedImages;
    });
  }, [images]);

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

  const isAnySelected = useMemo(
    () => [...selectedImages.values()].some((value) => value),
    [selectedImages],
  );

  const activeImageSelection = useMemo(
    () =>
      [...selectedImages.keys()].filter((imageId) =>
        selectedImages.get(imageId),
      ),
    [selectedImages],
  );

  const toggleSelectAll = useCallback(
    () => setSelectAll(!areAllSelected),
    [areAllSelected, setSelectAll],
  );

  const [openWithDatasetId, setOpenWithDatasetId] = useState<
    string | undefined
  >(dataset.id);

  // model selection popup
  const [isModelSelectionPopUpOpen, setIsModelSelectionPopUpOpen] =
    useState(false);
  const openModelSelectionPopUp = useCallback(() => {
    setIsModelSelectionPopUpOpen(true);
    setOpenWithDatasetId(dataset.id);
  }, [dataset.id]);
  const closeModelSelectionPopUp = useCallback(() => {
    setOpenWithDatasetId(undefined);
    setIsModelSelectionPopUpOpen(false);
    setSelectAll(false);
    setIsInSelectMode(false);
  }, [setSelectAll]);

  const { t: translate } = useTranslation();

  return (
    <StyledModal
      hideHeaderDivider={false}
      label={dataset.name}
      position="right"
      headerChildren={
        <DatasetNavigationbar
          isInSelectMode={isInSelectMode}
          allSelected={areAllSelected}
          anySelected={isAnySelected}
          toggleSelectMode={toggleSelectMode}
          toggleSelectAll={toggleSelectAll}
          openModelSelectionPopUp={openModelSelectionPopUp}
        />
      }
    >
      {isLoadingImages && <Text tx="images-loading" />}
      {isErrorImages && (
        <Text>{`${translate("images-loading-error")} ${
          imagesError?.response?.statusText
        } (${imagesError?.response?.status})`}</Text>
      )}
      {images && (
        <DatasetImageList
          isInSelectMode={isInSelectMode}
          images={images}
          refetchImages={refetchImages}
          selectedImages={selectedImages}
          setSelection={setSelection}
        />
      )}
      <JobCreationPopup
        isOpen={isModelSelectionPopUpOpen}
        onClose={closeModelSelectionPopUp}
        activeImageSelection={activeImageSelection}
        projectId={dataset.project}
        openWithDatasetId={openWithDatasetId}
      />
    </StyledModal>
  );
};
