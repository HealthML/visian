import {
  InvisibleButton,
  List,
  ListItem,
  PopUp,
  SectionHeader,
  SubtleText,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import {
  useAnnotationsByJob,
  useDeleteJobsForProjectMutation,
  usePatchJobStatusMutation,
} from "../../../../queries";
import useImagesByJob from "../../../../queries/use-images-by-jobs";
import { Image } from "../../../../types";
import { ConfirmationPopup } from "../../confirmation-popup";
import { editorPath } from "../../util";
import { JobLogPopup } from "../job-log-popup";
import { JobStatusBadge } from "../job-status-badge/job-status-badge";
import { DetailsRow, DetailsTable } from "./details-table";
import { JobDetailsPopUpProps } from "./job-details-popup.props";

const StyledPopUp = styled(PopUp)`
  align-items: left;
  width: 45vw;
  height: 60vh;
  max-width: 600px;
  max-height: 500px;
`;

const ClickableListItem = styled(ListItem)`
  &:hover {
    cursor: pointer;
  }
`;

const ScrollableList = styled(List)`
  overflow-y: auto;
  padding-right: 1em;
`;

const StyledDetailsTable = styled(DetailsTable)`
  padding: 1.5em 0;
`;

const StyledText = styled(Text)`
  padding-right: 0.8em;
`;

const IconButton = styled(InvisibleButton)`
  width: 30px;
`;

const Spacer = styled.div`
  width: 10px;
`;

const JobStatusControlsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const JobDetailsPopUp = observer<JobDetailsPopUpProps>(
  ({ job, isOpen, onClose }) => {
    const {
      annotations: jobAnnotations,
      annotationsError,
      isErrorAnnotations,
    } = useAnnotationsByJob(job.id);

    const {
      images: jobImages,
      imagesError,
      isErrorImages,
      isLoadingImages,
    } = useImagesByJob(job.id);

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { deleteJobs } = useDeleteJobsForProjectMutation();
    const { patchJobStatus } = usePatchJobStatusMutation();

    // delete job confirmation popup
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

    // cancel job confirmation popup
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

    // job log popup
    const [isJobLogPopUpOpen, setIsJobLogPopUpOpen] = useState(false);
    const openJobLogPopUp = useCallback(() => {
      setIsJobLogPopUpOpen(true);
    }, []);
    const closeJobLogPopUp = useCallback(() => {
      setIsJobLogPopUpOpen(false);
    }, []);

    useEffect(() => {
      if (!isOpen) {
        closeJobLogPopUp();
        closeDeleteJobConfirmationPopUp();
        closeCancelJobConfirmationPopUp();
      }
    }, [
      isOpen,
      closeJobLogPopUp,
      closeDeleteJobConfirmationPopUp,
      closeCancelJobConfirmationPopUp,
    ]);

    const imagesWithAnnotations = jobAnnotations?.map(
      (annotation) => annotation.image,
    );

    const findAnnotationId = useCallback(
      (imageId: string) => {
        const imageAnnotation = jobAnnotations?.find(
          (annotation) => annotation.image === imageId,
        );
        return imageAnnotation?.id;
      },
      [jobAnnotations],
    );

    const compareImages = useCallback(
      (a: Image, b: Image) => {
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
        projectId: job.project,
        jobIds: [job.id],
      });
      onClose?.();
    }, [deleteJobs, job, onClose]);

    const confirmCancelJob = useCallback(() => {
      patchJobStatus({
        projectId: job.project,
        jobId: job.id,
        jobStatus: "canceled",
      });
      onClose?.();
    }, [patchJobStatus, job, onClose]);

    return (
      <StyledPopUp
        titleTx="job-details"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        {job && (
          <>
            <JobStatusControlsContainer>
              <JobStatusBadge status={job.status} />
              <Spacer />
              {job.logFileUri && (
                <IconButton
                  icon="logs"
                  tooltipTx="open-job-log"
                  onPointerDown={openJobLogPopUp}
                  tooltipPosition="right"
                />
              )}
              {["queued", "running"].includes(job.status) ? (
                <IconButton
                  icon="cancel"
                  tooltipTx="cancel-job-title"
                  onPointerDown={openCancelJobConfirmationPopUp}
                  tooltipPosition="right"
                />
              ) : (
                <IconButton
                  icon="trash"
                  tooltipTx="delete-job-title"
                  onPointerDown={openDeleteJobConfirmationPopUp}
                  tooltipPosition="right"
                />
              )}
            </JobStatusControlsContainer>

            <StyledDetailsTable>
              <DetailsRow
                tx="job-model-name"
                value={`${job.modelName} ${job.modelVersion}`}
              />
              <DetailsRow tx="job-started" value={job.startedAt} />
              <DetailsRow tx="job-finished" value={job.finishedAt} />
              <DetailsRow
                tx="job-number-images"
                value={`${jobImages?.length ?? ""}`}
              />
              <DetailsRow
                tx="job-number-annotations"
                value={`${jobAnnotations?.length ?? ""}`}
              />
            </StyledDetailsTable>
          </>
        )}
        <SectionHeader tx="job-images" />

        {isErrorImages && (
          <Text>{`${t("images-loading-error")} ${
            imagesError?.response?.statusText
          } (${imagesError?.response?.status})`}</Text>
        )}

        {isErrorAnnotations && (
          <Text>{`${t("images-loading-error")} ${
            annotationsError?.response?.statusText
          } (${annotationsError?.response?.status})`}</Text>
        )}

        {isLoadingImages && <Text tx="images-loading" />}

        {jobImages && jobImages.length === 0 && (
          <Text tx="job-deleted-images" />
        )}

        {jobImages && !isErrorImages && !isErrorAnnotations && (
          <ScrollableList>
            {jobImages
              ?.sort(compareImages)
              .map((image: Image, index: number) => (
                <ClickableListItem
                  onClick={() =>
                    navigate(editorPath(image.id, findAnnotationId(image.id)))
                  }
                  isLast={index === jobImages.length - 1}
                >
                  <StyledText text={image.dataUri.split("/").pop()} />
                  {imagesWithAnnotations?.includes(image.id) && (
                    <SubtleText tx="image-annotated" />
                  )}
                </ClickableListItem>
              ))}
          </ScrollableList>
        )}
        <ConfirmationPopup
          isOpen={isDeleteJobConfirmationPopUpOpen}
          onClose={closeDeleteJobConfirmationPopUp}
          message={t("delete-job-message", {
            count: jobAnnotations?.length.toString() ?? "0",
          })}
          titleTx="delete-job-title"
          onConfirm={confirmDeleteJob}
        />
        <ConfirmationPopup
          isOpen={isCancelJobConfirmationPopUpOpen}
          onClose={closeCancelJobConfirmationPopUp}
          message="cancel-job-message"
          titleTx="cancel-job-title"
          onConfirm={confirmCancelJob}
        />
        <JobLogPopup
          isOpen={isJobLogPopUpOpen}
          onClose={closeJobLogPopUp}
          job={job}
        />
      </StyledPopUp>
    );
  },
);
