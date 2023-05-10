import { Modal, Notification, Text, useTranslation } from "@visian/ui-shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import {
  useDeleteAnnotationsForImageMutation,
  useDeleteImagesMutation,
  useImagesByDataset,
} from "../../../queries";
import { Annotation, Dataset, Image } from "../../../types";
import { ConfirmationPopup } from "../confimration-popup/confirmation-popup";
import { DatasetImageList } from "../dataset-image-list";
import { DatasetNavigationbar } from "../dataset-navigationbar";
import { ImageImportPopup } from "../image-import-popup";
import { JobCreationPopup } from "../job-creation-popup";

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
  z-index: 49;
`;
// TODO: z-index logic

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

  const { deleteImages } = useDeleteImagesMutation(dataset.id);

  const { deleteAnnotations } = useDeleteAnnotationsForImageMutation();

  const [annotationTobBeDeleted, setAnnotationTobBeDeleted] =
    useState<Annotation>();

  const [imageTobBeDeleted, setImageTobBeDeleted] = useState<Image>();

  const [selectedImages, setSelectedImages] = useState<Map<string, boolean>>(
    new Map((images ?? []).map((image) => [image.id, false])),
  );

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

  // model selection popup
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

  // image import popup
  const [imageImportPopUpOpenWith, setImageImportPopUpOpenWith] =
    useState<Dataset>();
  const openImageImportPopUp = useCallback(() => {
    setImageImportPopUpOpenWith(dataset);
  }, [dataset]);
  const closeImageImportPopUp = useCallback(() => {
    setImageImportPopUpOpenWith(undefined);
  }, []);

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
      <JobCreationPopup
        isOpen={!!jobCreationPopUpOpenWith}
        onClose={closeJobCreationPopUp}
        activeImageSelection={activeImageSelection}
        projectId={dataset.project}
        openWithDatasetId={jobCreationPopUpOpenWith}
      />
      <ImageImportPopup
        isOpen={!!imageImportPopUpOpenWith}
        onClose={closeImageImportPopUp}
        dataset={imageImportPopUpOpenWith}
        onImportFinished={refetchImages}
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
