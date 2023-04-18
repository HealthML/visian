import { Modal, Text, useTranslation } from "@visian/ui-shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import {
  useDeleteAnnotationsForImageMutation,
  useDeleteImagesMutation,
  useImagesByDataset,
} from "../../../queries";
import { Annotation, Dataset, Image } from "../../../types";
import { ConfirmationPopup } from "../confimration-popup/confirmation-popup";
import { DatasetImageList } from "../dataset-image-list";
import { DatasetNavigationbar } from "../dataset-navigationbar";
import { ModelSelectionPopup } from "../ml-model-popup";

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

  const { deleteImages } = useDeleteImagesMutation(dataset.id);

  const { deleteAnnotations } = useDeleteAnnotationsForImageMutation();

  const [annotationTobBeDeleted, setAnnotationTobBeDeleted] =
    useState<Annotation>();

  const [imageTobBeDeleted, setImageTobBeDeleted] = useState<Image>();

  const [selectedImages, setSelectedImages] = useState<Map<string, boolean>>(
    new Map((images ?? []).map((image) => [image.id, false])),
  );

  // model selection popup
  const [isModelSelectionPopUpOpen, setIsModelSelectionPopUpOpen] =
    useState(false);
  const openModelSelectionPopUp = useCallback(() => {
    setIsModelSelectionPopUpOpen(true);
  }, []);
  const closeModelSelectionPopUp = useCallback(() => {
    setIsModelSelectionPopUpOpen(false);
  }, []);

  // delete annotation confirmation popup
  const [
    isDeleteAnnotationConfirmationPopUpOpen,
    setIsDeleteAnnotationConfirmationPopUpOpen,
  ] = useState(false);
  const openDeleteAnnotationConfirmationPopUp = useCallback(() => {
    setIsDeleteAnnotationConfirmationPopUpOpen(true);
  }, []);
  const closeDeleteAnnotationConfirmationPopUp = useCallback(() => {
    setIsDeleteAnnotationConfirmationPopUpOpen(false);
    setAnnotationTobBeDeleted(undefined);
  }, []);

  // delete images confirmation popup
  const [
    isDeleteImagesConfirmationPopUpOpen,
    setIsDeleteImagesConfirmationPopUpOpen,
  ] = useState(false);
  const openDeleteImagesConfirmationPopUp = useCallback(() => {
    setIsDeleteImagesConfirmationPopUpOpen(true);
  }, []);
  const closeDeleteImagesConfirmationPopUp = useCallback(() => {
    setIsDeleteImagesConfirmationPopUpOpen(false);
    setImageTobBeDeleted(undefined);
  }, []);

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

  const deleteSelectedImages = useCallback(() => {
    deleteImages(activeImageSelection);
  }, [activeImageSelection, deleteImages]);

  const deleteAnnotation = useCallback(
    (annotation: Annotation) => {
      setAnnotationTobBeDeleted(annotation);
      openDeleteAnnotationConfirmationPopUp();
    },
    [setAnnotationTobBeDeleted, openDeleteAnnotationConfirmationPopUp],
  );

  const deleteImage = useCallback(
    (image: Image) => {
      setImageTobBeDeleted(image);
      openDeleteImagesConfirmationPopUp();
    },
    [setImageTobBeDeleted, openDeleteImagesConfirmationPopUp],
  );

  const { t: translate } = useTranslation();

  const deleteAnnotationMessage = useMemo(
    () =>
      `${translate("delete-annotation-message")}`.replace(
        "_",
        annotationTobBeDeleted?.dataUri ?? "",
      ),
    [annotationTobBeDeleted, translate],
  );

  const deleteImagesMessage = useMemo(
    () =>
      imageTobBeDeleted
        ? `${translate("delete-image-message")}`.replace(
            "_",
            imageTobBeDeleted.dataUri,
          )
        : `${translate("delete-images-message")}`.replace(
            "_",
            activeImageSelection.length.toString(),
          ),
    [activeImageSelection, translate, imageTobBeDeleted],
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
          anySelected={isAnySelected}
          toggleSelectMode={toggleSelectMode}
          toggleSelectAll={toggleSelectAll}
          openModelSelectionPopUp={openModelSelectionPopUp}
          deleteSelectedImages={openDeleteImagesConfirmationPopUp}
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
          deleteAnnotation={deleteAnnotation}
          deleteImage={deleteImage}
        />
      )}
      <ModelSelectionPopup
        isOpen={isModelSelectionPopUpOpen}
        onClose={closeModelSelectionPopUp}
        activeImageSelection={activeImageSelection}
        projectId={dataset.project}
      />
      <ConfirmationPopup
        isOpen={isDeleteAnnotationConfirmationPopUpOpen}
        onClose={closeDeleteAnnotationConfirmationPopUp}
        message={deleteAnnotationMessage}
        titleTx="delete-annotation-title"
        onConfirm={() => {
          if (annotationTobBeDeleted)
            deleteAnnotations({
              imageId: annotationTobBeDeleted.image,
              annotationIds: [annotationTobBeDeleted.id],
            });
        }}
      />
      <ConfirmationPopup
        isOpen={isDeleteImagesConfirmationPopUpOpen}
        onClose={closeDeleteImagesConfirmationPopUp}
        message={deleteImagesMessage}
        titleTx={
          imageTobBeDeleted ? "delete-image-title" : "delete-images-title"
        }
        onConfirm={() => {
          if (imageTobBeDeleted) {
            deleteImages([imageTobBeDeleted.id]);
          } else {
            deleteSelectedImages();
          }
        }}
      />
    </StyledModal>
  );
};
