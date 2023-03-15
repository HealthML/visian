import {
  color as getColor,
  List,
  ListItem,
  PopUp,
  SectionHeader,
  Spacer,
  Text,
  Theme,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useAnnotationsByJob } from "../../../../queries";
import useImagesByJob from "../../../../queries/use-images-by-jobs";
import { editorPath } from "../../util";
import { JobDetailsPopUpProps } from "./job-details-popup.props";

const StyledPopUp = styled(PopUp)`
  align-items: left;
  width: 45vw;
  height: 60vh;
`;

const ClickableListItem = styled(ListItem)`
  &:hover {
    cursor: pointer;
  }
`;

const ScrollableList = styled(List)`
  overflow-y: auto;
`;

const AnnotationStatus = styled.div<{ color: string; borderColor: string }>`
  width: 1em;
  height: 1em;
  border-radius: 50%;
  background-color: ${(props) =>
    getColor(props.color as keyof Theme["colors"])};
  border-color: ${(props) =>
    getColor(props.borderColor as keyof Theme["colors"])};
`;

export const JobDetailsPopUp = observer<JobDetailsPopUpProps>(
  ({ job, isOpen, onClose }) => {
    const { annotations, annotationsError, isErrorAnnotations } =
      useAnnotationsByJob(job.id);

    const { images, imagesError, isErrorImages, isLoadingImages } =
      useImagesByJob(job.id);

    const { t } = useTranslation();
    const navigate = useNavigate();

    const imagesWithAnnotations = annotations?.map(
      (annotation) => annotation.image,
    );

    const findAnnotationId = useCallback(
      (imageId: string) => {
        const annotation = annotations?.find((anno) => anno.image === imageId);
        return annotation?.id;
      },
      [annotations],
    );

    return (
      <StyledPopUp
        titleTx="job-details"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <SectionHeader tx="job-selected-images" />
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
        {images && !isErrorAnnotations && (
          <ScrollableList>
            {images?.map((image) => (
              <ClickableListItem
                onClick={() =>
                  navigate(editorPath(image.id, findAnnotationId(image.id)))
                }
              >
                {image.dataUri}
                <Spacer />
                {imagesWithAnnotations?.includes(image.id) && (
                  <AnnotationStatus
                    color="greenBorder"
                    borderColor="greenBorder"
                  />
                )}
              </ClickableListItem>
            ))}
          </ScrollableList>
        )}
      </StyledPopUp>
    );
  },
);
