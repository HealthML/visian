import { Notification, useTranslation } from "@visian/ui-shared";
import { MiaAnnotation, MiaDataset, MiaImage } from "@visian/utils";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { MiaReviewStrategy } from "../../../models/review-strategy";
import {
  deleteAnnotationsForImageMutation,
  deleteImagesMutation,
  useDatasetProgress,
  useImagesByDataset,
} from "../../../queries";
import { AnnotationProgress } from "../annotation-progress";
import { ConfirmationPopup } from "../confirmation-popup";
import { ImageImportPopup } from "../image-import-popup";
import { ImageList } from "../image-list";
import { JobCreationPopup } from "../job-creation-popup";
import { PaddedPageSectionIconButton, PageSection } from "../page-section";
import { PageTitle } from "../page-title";
import { useImageSelection, usePopUpState } from "../util";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ErrorNotification = styled(Notification)`
  position: absolute;
  min-width: 30%;
  left: 50%;
  bottom: 15%;
  transform: translateX(-50%);
`;

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ActionIconButton = styled(PaddedPageSectionIconButton)`
  height: 25px;
`;

export const DatasetPage = ({
  dataset,
  isDraggedOver,
  onDropCompleted,
}: {
  dataset: MiaDataset;
  isDraggedOver: boolean;
  onDropCompleted: () => void;
}) => {
  const store = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: progress, isLoading: isLoadingProgress } = useDatasetProgress(
    dataset.id,
  );

  const {
    data: images,
    error: imagesError,
    isLoading: isLoadingImages,
    refetch: refetchImages,
  } = useImagesByDataset(dataset.id);

  const { selectedImages, selectImages } = useImageSelection();

  const { mutate: deleteImages } = deleteImagesMutation();
  const { mutate: deleteAnnotations } = deleteAnnotationsForImageMutation();

  const [annotationTobBeDeleted, setAnnotationTobBeDeleted] =
    useState<MiaAnnotation>();

  const [imagesTobBeDeleted, setImagesTobBeDeleted] = useState<MiaImage[]>([]);

  // Delete annotation confirmation popup
  const [
    isDeleteAnnotationConfirmationPopUpOpen,
    openDeleteAnnotationConfirmationPopUp,
    closeDeleteAnnotationConfirmationPopUp,
  ] = usePopUpState(false);

  // Image delete popup
  const [
    isDeleteImagesConfirmationPopUpOpen,
    openDeleteImagesConfirmationPopUp,
    closeDeleteImagesConfirmationPopUp,
  ] = usePopUpState(false);

  const openDeletePopup = useCallback(
    (imagesToDelete: MiaImage[]) => {
      setImagesTobBeDeleted(imagesToDelete);
      openDeleteImagesConfirmationPopUp();
    },
    [setImagesTobBeDeleted, openDeleteImagesConfirmationPopUp],
  );

  const closeDeleteImagesConfirmationPopUpAndClearSelection =
    useCallback(() => {
      closeDeleteImagesConfirmationPopUp();
      setImagesTobBeDeleted([]);
      selectImages([]);
    }, [closeDeleteImagesConfirmationPopUp, selectImages]);

  const deleteSelectedImages = useCallback(() => {
    deleteImages({
      objectIds: imagesTobBeDeleted.map((image) => image.id),
      selectorId: dataset.id,
    });
  }, [imagesTobBeDeleted, deleteImages, dataset.id]);

  // Job selection popup
  const [jobCreationPopUpOpenWith, setJobCreationPopUpOpenWith] =
    useState<string>();

  const openJobCreationPopUp = useCallback(() => {
    setJobCreationPopUpOpenWith(dataset.id);
  }, [dataset.id]);

  const closeJobCreationPopUp = useCallback(() => {
    setJobCreationPopUpOpenWith(undefined);
    selectImages([]);
  }, [selectImages]);

  // Image import popup
  const [imageImportPopUpOpenWith, setImageImportPopUpOpenWith] =
    useState<MiaDataset>();

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

  const deleteAnnotation = useCallback(
    (annotation: MiaAnnotation) => {
      setAnnotationTobBeDeleted(annotation);
      openDeleteAnnotationConfirmationPopUp();
    },
    [setAnnotationTobBeDeleted, openDeleteAnnotationConfirmationPopUp],
  );

  const handleAnnotationConfirmation = useCallback(() => {
    if (annotationTobBeDeleted)
      deleteAnnotations({
        objectIds: [annotationTobBeDeleted.id],
        selectorId: annotationTobBeDeleted.image,
      });
  }, [annotationTobBeDeleted, deleteAnnotations]);

  const startReviewWithDataset = useCallback(
    () =>
      store?.startReview(
        async () => MiaReviewStrategy.fromDataset(store, dataset.id),
        navigate,
      ),
    [navigate, dataset, store],
  );

  const startReviewWithSelected = useCallback(
    (imagesToReview: MiaImage[]) =>
      store?.startReview(
        async () =>
          MiaReviewStrategy.fromImageIds(store, [
            ...imagesToReview.map((i) => i.id),
          ]),
        navigate,
      ),
    [navigate, store],
  );

  let listInfoTx;
  if (imagesError) listInfoTx = "images-loading-failed";
  else if (images && images.length === 0) listInfoTx = "no-images-available";

  let progressInfoTx;
  if (progress?.totalImages === 0)
    progressInfoTx = "annotation-progress-no-images";

  return (
    <Container>
      <PageTitle
        title={dataset.name}
        labelTx="dataset"
        backPath={`/projects/${dataset.project}`}
      />
      <PageSection
        titleTx="annotation-progress"
        isLoading={isLoadingProgress}
        infoTx={progressInfoTx}
      >
        {progress && (
          <AnnotationProgress
            progress={progress}
            onReviewClick={startReviewWithDataset}
          />
        )}
      </PageSection>
      <PageSection
        titleTx="images"
        isLoading={isLoadingImages}
        infoTx={listInfoTx}
        showActions={!imagesError}
        actions={
          <ActionContainer>
            <ActionIconButton
              icon="plus"
              tooltipTx="import-images"
              tooltipPosition="left"
              onPointerDown={openImageImportPopUp}
            />
          </ActionContainer>
        }
      >
        {images && (
          <ImageList
            images={images}
            selectedImages={[...selectedImages]}
            onSelect={selectImages}
            onImageDelete={openDeletePopup}
            onStartJob={openJobCreationPopUp}
            onStartReview={startReviewWithSelected}
            showAnnotations
            onAnnotationDelete={deleteAnnotation}
          />
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
          message={t("delete-annotation-message", {
            name: annotationTobBeDeleted?.dataUri ?? "",
          })}
          titleTx="delete-annotation-title"
          onConfirm={handleAnnotationConfirmation}
        />
        <ConfirmationPopup
          isOpen={isDeleteImagesConfirmationPopUpOpen}
          onClose={closeDeleteImagesConfirmationPopUpAndClearSelection}
          message={
            imagesTobBeDeleted.length === 1
              ? t("delete-image-message", {
                  name: imagesTobBeDeleted[0].dataUri ?? "",
                })
              : t("delete-images-message", {
                  count: selectedImages.size,
                })
          }
          titleTx={
            imagesTobBeDeleted ? "delete-image-title" : "delete-images-title"
          }
          onConfirm={deleteSelectedImages}
        />
        {store?.error && (
          <ErrorNotification
            title={store?.error.title}
            titleTx={store?.error.titleTx}
            description={store?.error.description}
            descriptionTx={store?.error.descriptionTx}
            descriptionData={store?.error.descriptionData}
          />
        )}
      </PageSection>
    </Container>
  );
};
