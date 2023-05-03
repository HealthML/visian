import {
  List,
  ListItem,
  PopUp,
  SectionHeader,
  SubtleText,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useAnnotationsByJob } from "../../../../queries";
import useImagesByJob from "../../../../queries/use-images-by-jobs";
import { Image } from "../../../../types";
import { editorPath } from "../../util";
import { JobStatusBadge } from "../job-status-badge/job-status-badge";
import { DetailsRow, DetailsTable } from "./details-table";
import { JobDetailsPopUpProps } from "./job-details-popup.props";

const StyledPopUp = styled(PopUp)`
  align-items: left;
  width: 45vw;
  height: 60vh;
  max-width: 600px;
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

    const compareImages = (a: Image, b: Image) => {
      if (findAnnotationId(a.id) && !findAnnotationId(b.id)) {
        return -1;
      }
      if (!findAnnotationId(a.id) && findAnnotationId(b.id)) {
        return 1;
      }
      return 0;
    };

    return (
      <StyledPopUp
        titleTx="job-details"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        {job && (
          <>
            <JobStatusBadge status={job.status} />
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
        {jobImages && !isErrorAnnotations && (
          <ScrollableList>
            {jobImages?.sort(compareImages).map((image) => (
              <ClickableListItem
                onClick={() =>
                  navigate(editorPath(image.id, findAnnotationId(image.id)))
                }
              >
                <StyledText text={image.dataUri} />
                {imagesWithAnnotations?.includes(image.id) && (
                  <SubtleText tx="image-annotated" />
                )}
              </ClickableListItem>
            ))}
          </ScrollableList>
        )}
      </StyledPopUp>
    );
  },
);
