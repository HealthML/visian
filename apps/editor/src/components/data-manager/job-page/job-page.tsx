import {
  MiaImage,
  MiaJob,
  JobsControllerUpdateStatusEnum,
} from "@visian/mia-api";
import {
  InvisibleButton,
  ListItem,
  Sheet,
  space,
  SubtleText,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { MiaReviewStrategy } from "../../../models/review-strategy";
import {
  deleteJobsMutation,
  updateJobMutation,
  useAnnotationsByJob,
  useImagesByJob,
  useJobProgress,
} from "../../../queries";
import { AnnotationProgress } from "../annotation-progress";
import { ConfirmationPopup } from "../confirmation-popup";
import { JobLogPopup } from "../job-history/job-log-popup";
import { JobStatusBadge } from "../job-history/job-status-badge/job-status-badge";
import { PageRow } from "../page-row";
import { PageSection } from "../page-section";
import { PageTitle } from "../page-title";
import { getDisplayDate } from "../util";
import { DetailsRow } from "./details-table";

const StyledSheet = styled(Sheet)`
  padding: ${space("listPadding")};
  box-sizing: border-box;
`;

const DetailsSheet = styled(Sheet)`
  padding: ${space("pageSectionMarginSmall")};
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ClickableListItem = styled(ListItem)`
  width: 100%;
  &:hover {
    cursor: pointer;
  }
`;

const StyledText = styled(Text)`
  padding-right: 0.8em;
`;

const IconButton = styled(InvisibleButton)`
  width: 30px;
`;

export const JobPage = ({ job }: { job: MiaJob }) => {
  const { data: progress, isLoading: isLoadingProgress } = useJobProgress(
    job.id,
  );

  const { annotations, isErrorAnnotations } = useAnnotationsByJob(job.id);
  const {
    data: images,
    error: imagesError,
    isError: isErrorImages,
    isLoading: isLoadingImages,
  } = useImagesByJob(job.id);

  const store = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: deleteJobs } = deleteJobsMutation();
  const { mutate: patchJobStatus } = updateJobMutation();

  // Delete job confirmation popup
  const [
    isDeleteJobConfirmationPopUpOpen,
    setIsDeleteJobConfirmationPopUpOpen,
  ] = useState(false);
  const openDeleteJobConfirmationPopUp = useCallback(() => {
    setIsDeleteJobConfirmationPopUpOpen(true);
  }, []);
  const closeDeleteJobConfirmationPopUp = useCallback(() => {
    setIsDeleteJobConfirmationPopUpOpen(false);
  }, []);

  // Cancel job confirmation popup
  const [
    isCancelJobConfirmationPopUpOpen,
    setIsCancelJobConfirmationPopUpOpen,
  ] = useState(false);
  const openCancelJobConfirmationPopUp = useCallback(() => {
    setIsCancelJobConfirmationPopUpOpen(true);
  }, []);
  const closeCancelJobConfirmationPopUp = useCallback(() => {
    setIsCancelJobConfirmationPopUpOpen(false);
  }, []);

  // Job log popup
  const [isJobLogPopUpOpen, setIsJobLogPopUpOpen] = useState(false);
  const openJobLogPopUp = useCallback(() => setIsJobLogPopUpOpen(true), []);
  const closeJobLogPopUp = useCallback(() => setIsJobLogPopUpOpen(false), []);

  const imagesWithAnnotations = annotations?.map(
    (annotation) => annotation.image,
  );

  const findAnnotationId = useCallback(
    (imageId: string) => {
      const imageAnnotation = annotations?.find(
        (annotation) => annotation.image === imageId,
      );
      return imageAnnotation?.id;
    },
    [annotations],
  );

  const compareImages = useCallback(
    (a: MiaImage, b: MiaImage) => {
      if (findAnnotationId(a.id) && !findAnnotationId(b.id)) {
        return -1;
      }
      if (!findAnnotationId(a.id) && findAnnotationId(b.id)) {
        return 1;
      }
      return 0;
    },
    [findAnnotationId],
  );

  const confirmDeleteJob = useCallback(() => {
    deleteJobs({
      selectorId: job.project,
      objectIds: [job.id],
    });
    navigate(`/projects/${job.project}`);
  }, [deleteJobs, job, navigate]);

  const confirmCancelJob = useCallback(
    () =>
      patchJobStatus({
        object: job,
        updateDto: { status: JobsControllerUpdateStatusEnum.Canceled },
        selectorId: job.id,
      }),
    [patchJobStatus, job],
  );

  const startReviewJob = useCallback(
    async (annotationId?: string) => {
      store?.startReview(
        async () =>
          annotationId
            ? MiaReviewStrategy.fromAnnotationId(store, annotationId)
            : MiaReviewStrategy.fromJob(store, job.id),
        navigate,
      );
    },
    [navigate, job, store],
  );

  let listInfoTx;
  if (imagesError) listInfoTx = "images-loading-failed";
  else if (images && images.length === 0) listInfoTx = "no-images-available";

  let progressInfoTx;
  if (progress?.totalImages === 0)
    progressInfoTx = "annotation-progress-no-images";

  const startedAt = job.startedAt
    ? getDisplayDate(new Date(job.startedAt))
    : "";
  const finishedAt = job.finishedAt
    ? getDisplayDate(new Date(job.finishedAt))
    : "";

  return (
    <Container>
      <PageTitle
        title={t("job-title", { date: startedAt })}
        labelTx="job"
        backPath={`/projects/${job.project}`}
      />
      <PageRow
        columns={[
          {
            width: 66,
            element: (
              <PageSection
                titleTx="annotation-progress"
                isLoading={isLoadingProgress}
                infoTx={progressInfoTx}
              >
                {progress && (
                  <AnnotationProgress
                    progress={progress}
                    onReviewClick={async () => startReviewJob()}
                  />
                )}
              </PageSection>
            ),
          },
          {
            width: 33,
            element: (
              <PageSection titleTx="job-details">
                <DetailsSheet>
                  <DetailsRow
                    tx="job-status"
                    content={
                      <>
                        <JobStatusBadge status={job.status} />
                        {job.logFileUri && (
                          <IconButton
                            icon="logs"
                            tooltipTx="open-job-log"
                            onClick={openJobLogPopUp}
                            tooltipPosition="right"
                          />
                        )}
                        {["queued", "running"].includes(job.status) ? (
                          <IconButton
                            icon="cancel"
                            tooltipTx="cancel-job-title"
                            onClick={openCancelJobConfirmationPopUp}
                            tooltipPosition="right"
                          />
                        ) : (
                          <IconButton
                            icon="trash"
                            tooltipTx="delete-job-title"
                            onClick={openDeleteJobConfirmationPopUp}
                            tooltipPosition="right"
                          />
                        )}
                      </>
                    }
                  />
                  <DetailsRow
                    tx="job-model-name"
                    value={`${job.modelName} v${job.modelVersion}`}
                  />
                  <DetailsRow tx="job-started" value={startedAt} />
                  <DetailsRow tx="job-finished" value={finishedAt} />
                </DetailsSheet>
              </PageSection>
            ),
          },
        ]}
      />

      <PageSection
        titleTx="images"
        isLoading={isLoadingImages}
        infoTx={listInfoTx}
        showActions={!imagesError}
      >
        {images && !isErrorImages && !isErrorAnnotations && (
          <StyledSheet>
            {images
              ?.sort(compareImages)
              .map((image: MiaImage, index: number) => (
                <ClickableListItem
                  key={image.id}
                  onClick={async () => {
                    const annotationId = findAnnotationId(image.id);
                    if (annotationId) await startReviewJob(annotationId);
                  }}
                  isLast={index === images.length - 1}
                >
                  <StyledText text={image.dataUri.split("/").pop()} />
                  {imagesWithAnnotations?.includes(image.id) && (
                    <SubtleText tx="image-annotated" />
                  )}
                </ClickableListItem>
              ))}
          </StyledSheet>
        )}
        <ConfirmationPopup
          isOpen={isDeleteJobConfirmationPopUpOpen}
          onClose={closeDeleteJobConfirmationPopUp}
          message={t("delete-job-message", {
            count: annotations?.length ?? "0",
          })}
          titleTx="delete-job-title"
          onConfirm={confirmDeleteJob}
        />
        <ConfirmationPopup
          isOpen={isCancelJobConfirmationPopUpOpen}
          onClose={closeCancelJobConfirmationPopUp}
          messageTx="cancel-job-message"
          titleTx="cancel-job-title"
          onConfirm={confirmCancelJob}
        />
        <JobLogPopup
          isOpen={isJobLogPopUpOpen}
          onClose={closeJobLogPopUp}
          job={job}
        />
      </PageSection>
    </Container>
  );
};
