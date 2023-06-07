import { Modal, Notification, Text, useTranslation } from "@visian/ui-shared";
import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import {
  useDeleteAnnotationsForImageMutation,
  useDeleteImagesMutation,
  useImagesByDataset,
} from "../../../queries";
import { Annotation, Dataset, Image } from "../../../types";
import { ConfirmationPopup } from "../confirmation-popup";
import { DatasetImageList } from "../dataset-image-list";
import { DatasetNavigationBar } from "../dataset-navigationbar";
import { ImageImportPopup } from "../image-import-popup";
import { JobCreationPopup } from "../job-creation-popup";
import { useImageSelection, usePopUpState } from "../util";

const StyledModal = styled(Modal)`
  width: 100%;
`;

const ErrorMessage = styled(Text)`
  margin: auto;
`;

const ErrorNotification = styled(Notification)`
  position: absolute;
  min-width: 30%;
  left: 50%;
  bottom: 15%;
  transform: translateX(-50%);
`;

export const DatasetExplorer = ({
  dataset,
  isDraggedOver,
  onDropCompleted,
}: {
  dataset: Dataset;
  isDraggedOver: boolean;
  onDropCompleted: () => void;
}) => {
  const store = useStore();

  const [isInSelectMode, setIsInSelectMode] = useState(false);

  const { images, imagesError, isErrorImages, isLoadingImages, refetchImages } =
    useImagesByDataset(dataset.id);

  const { selectedImages, setSelectedImages, setImageSelection } =
    useImageSelection();

  const setSelectAll = useCallback(
    (selection: boolean) => {
      if (selection) {
        const newSelection = new Set<string>();
        images?.forEach((image) => newSelection.add(image.id));
        setSelectedImages(newSelection);
        return;
      }
      setSelectedImages(new Set<string>());
    },
    [images, setSelectedImages],
  );

  const { deleteImages } = useDeleteImagesMutation(dataset.id);

  const { deleteAnnotations } = useDeleteAnnotationsForImageMutation();

  const [annotationTobBeDeleted, setAnnotationTobBeDeleted] =
    useState<Annotation>();

  const [imageTobBeDeleted, setImageTobBeDeleted] = useState<Image>();

  // Delete annotation confirmation popup
  const [
    isDeleteAnnotationConfirmationPopUpOpen,
    openDeleteAnnotationConfirmationPopUp,
    closeDeleteAnnotationConfirmationPopUp,
  ] = usePopUpState(false);

  // Delete images confirmation popup
  const [
    isDeleteImagesConfirmationPopUpOpen,
    openDeleteImagesConfirmationPopUp,
    closeDeleteImagesConfirmationPopUp,
  ] = usePopUpState(false);

  const toggleSelectMode = useCallback(() => {
    setIsInSelectMode((prevIsInSelectMode) => !prevIsInSelectMode);
  }, []);

  const areAllSelected = useMemo(
    () => selectedImages.size === (images?.length || 0),
    [selectedImages, images],
  );

  const isAnySelected = selectedImages.size > 0;

  const toggleSelectAll = useCallback(
    () => setSelectAll(!areAllSelected),
    [areAllSelected, setSelectAll],
  );

  // Job selection popup
  const [jobCreationPopUpOpenWith, setJobCreationPopUpOpenWith] =
    useState<string>();
  const openJobCreationPopUp = useCallback(() => {
    setJobCreationPopUpOpenWith(dataset.id);
  }, [dataset.id]);
  const closeJobCreationPopUp = useCallback(() => {
    setJobCreationPopUpOpenWith(undefined);
    setSelectAll(false);
    setIsInSelectMode(false);
  }, [setSelectAll]);

  // Image import popup
  const [imageImportPopUpOpenWith, setImageImportPopUpOpenWith] =
    useState<Dataset>();
  const openImageImportPopUp = useCallback(() => {
    setImageImportPopUpOpenWith(dataset);
  }, [dataset]);
  const closeImageImportPopUp = useCallback(() => {
    setImageImportPopUpOpenWith(undefined);
  }, []);

  const handleImageImportDropCompleted = useCallback(() => {
    setImageImportPopUpOpenWith(dataset);
    onDropCompleted();
  }, [setImageImportPopUpOpenWith, dataset, onDropCompleted]);

  const deleteSelectedImages = useCallback(() => {
    deleteImages(Array.from(selectedImages));
  }, [selectedImages, deleteImages]);

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

  const handleAnnotationConfirmation = useCallback(() => {
    if (annotationTobBeDeleted)
      deleteAnnotations({
        imageId: annotationTobBeDeleted.image,
        annotationIds: [annotationTobBeDeleted.id],
      });
  }, [annotationTobBeDeleted, deleteAnnotations]);

  const handleImageConfirmation = useCallback(() => {
    if (imageTobBeDeleted) {
      deleteImages([imageTobBeDeleted.id]);
    } else {
      deleteSelectedImages();
    }
  }, [imageTobBeDeleted, deleteImages, deleteSelectedImages]);

  const { t: translate } = useTranslation();

  return (
    <StyledModal
      hideHeaderDivider={false}
      label={dataset.name}
      position="right"
      headerChildren={
        <DatasetNavigationBar
          isInSelectMode={isInSelectMode}
          allSelected={areAllSelected}
          anySelected={isAnySelected}
          toggleSelectMode={toggleSelectMode}
          toggleSelectAll={toggleSelectAll}
          openJobCreationPopUp={openJobCreationPopUp}
          openImageImportPopUp={openImageImportPopUp}
          deleteSelectedImages={openDeleteImagesConfirmationPopUp}
        />
      }
    >
      {store?.error && (
        <ErrorNotification
          title={store?.error.title}
          titleTx={store?.error.titleTx}
          description={store?.error.description}
          descriptionTx={store?.error.descriptionTx}
          descriptionData={store?.error.descriptionData}
        />
      )}
      {isLoadingImages ? (
        <ErrorMessage tx="images-loading" />
      ) : isErrorImages ? (
        <ErrorMessage
          text={translate("images-loading-error", {
            statusText: imagesError?.response?.statusText,
            status: imagesError?.response?.status,
          })}
        />
      ) : images && images.length > 0 ? (
        <DatasetImageList
          isInSelectMode={isInSelectMode}
          images={images}
          refetchImages={refetchImages}
          selectedImages={selectedImages}
          setImageSelection={setImageSelection}
          setSelectedImages={setSelectedImages}
          deleteAnnotation={deleteAnnotation}
          deleteImage={deleteImage}
        />
      ) : (
        <ErrorMessage tx="no-images-available" />
      )}
      <JobCreationPopup
        isOpen={!!jobCreationPopUpOpenWith}
        onClose={closeJobCreationPopUp}
        activeImageSelection={selectedImages}
        projectId={dataset.project}
        openWithDatasetId={jobCreationPopUpOpenWith}
      />
      <ImageImportPopup
        isOpen={!!imageImportPopUpOpenWith}
        onClose={closeImageImportPopUp}
        dataset={imageImportPopUpOpenWith}
        onImportFinished={refetchImages}
        isDraggedOver={isDraggedOver}
        onDropCompleted={handleImageImportDropCompleted}
      />
      <ConfirmationPopup
        isOpen={isDeleteAnnotationConfirmationPopUpOpen}
        onClose={closeDeleteAnnotationConfirmationPopUp}
        message={translate("delete-annotation-message", {
          name: annotationTobBeDeleted?.dataUri ?? "",
        })}
        titleTx="delete-annotation-title"
        onConfirm={handleAnnotationConfirmation}
      />
      <ConfirmationPopup
        isOpen={isDeleteImagesConfirmationPopUpOpen}
        onClose={closeDeleteImagesConfirmationPopUp}
        message={translate("delete-images-message", {
          name: imageTobBeDeleted?.dataUri ?? selectedImages.size.toString(),
        })}
        titleTx={
          imageTobBeDeleted ? "delete-image-title" : "delete-images-title"
        }
        onConfirm={handleImageConfirmation}
      />
    </StyledModal>
  );
};
