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
import { ConfirmationPopup } from "../confirmation-popup/confirmation-popup";
import { DatasetImageList } from "../dataset-image-list";
import { DatasetNavigationbar } from "../dataset-navigationbar";
import { JobCreationPopup } from "../job-creation-popup";
import { useImageSelection } from "../util";

const StyledModal = styled(Modal)`
  width: 100%;
`;

const ErrorNotification = styled(Notification)`
  position: absolute;
  min-width: 30%;
  left: 50%;
  bottom: 15%;
  transform: translateX(-50%);
`;

export const DatasetExplorer = ({ dataset }: { dataset: Dataset }) => {
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

  const toggleSelectMode = useCallback(() => {
    setIsInSelectMode((prevIsInSelectMode) => !prevIsInSelectMode);
  }, []);

  const areAllSelected = useMemo(
    () => selectedImages.size === (images?.length || 0),
    [selectedImages, images],
  );

  const isAnySelected = useMemo(
    () => selectedImages.size > 0,
    [selectedImages],
  );

  const toggleSelectAll = useCallback(
    () => setSelectAll(!areAllSelected),
    [areAllSelected, setSelectAll],
  );

  const [openWithDatasetId, setOpenWithDatasetId] = useState<
    string | undefined
  >(dataset.id);

  // job creation popup
  const [isJobCreationPopUpOpen, setIsJobCreationPopUpOpen] = useState(false);
  const openJobCreationPopUp = useCallback(() => {
    setIsJobCreationPopUpOpen(true);
    setOpenWithDatasetId(dataset.id);
  }, [dataset.id]);
  const closeJobCreationPopUp = useCallback(() => {
    setOpenWithDatasetId(undefined);
    setIsJobCreationPopUpOpen(false);
    setSelectAll(false);
    setIsInSelectMode(false);
  }, [setSelectAll]);
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
            selectedImages.size.toString(),
          ),
    [selectedImages, translate, imageTobBeDeleted],
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
          openJobCreationPopUp={openJobCreationPopUp}
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
          setImageSelection={setImageSelection}
          setSelectedImages={setSelectedImages}
          deleteAnnotation={deleteAnnotation}
          deleteImage={deleteImage}
        />
      )}
      <JobCreationPopup
        isOpen={isJobCreationPopUpOpen}
        onClose={closeJobCreationPopUp}
        activeImageSelection={selectedImages}
        projectId={dataset.project}
        openWithDatasetId={openWithDatasetId}
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
