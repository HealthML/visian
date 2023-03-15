import {
  fontSize,
  List,
  ListItem,
  PopUp,
  Subtitle,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { useAnnotationsByJob } from "../../../../queries";
import { Job } from "../../../../types";
import { JobDetailsPopUpProps } from "./job-details-popup.props";

const StyledPopUp = styled(PopUp)`
  align-items: left;
  width: 45vw;
`;

const StyledSubtitle = styled(Subtitle)`
  font-size: ${fontSize("navigation")};
`;

export const JobDetailsPopUp = observer<JobDetailsPopUpProps>(
  ({ job, isOpen, onClose }) => {
    const {
      annotations,
      annotationsError,
      isErrorAnnotations,
      isLoadingAnnotations,
    } = useAnnotationsByJob(job.id);

    const { t } = useTranslation();

    return (
      <StyledPopUp
        titleTx="job-details"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <StyledSubtitle tx={"annotations-generated"} />
        {isErrorAnnotations && (
          <Text>{`${t("annotations-loading-error")} ${
            annotationsError?.response?.statusText
          } (${annotationsError?.response?.status})`}</Text>
        )}
        {isLoadingAnnotations && <Text tx="annotations-loading" />}
        {annotations && (
          <List>
            {annotations?.map((annotation) => (
              <ListItem>{annotation.dataUri}</ListItem>
            ))}
          </List>
        )}
      </StyledPopUp>
    );
  },
);
