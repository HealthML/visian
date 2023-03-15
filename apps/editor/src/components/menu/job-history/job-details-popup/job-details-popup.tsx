import {
  SectionHeader,
  List,
  ListItem,
  PopUp,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAnnotationsByJob } from "../../../../queries";
import { editorPath } from "../../util";
import { JobDetailsPopUpProps } from "./job-details-popup.props";

const StyledPopUp = styled(PopUp)`
  align-items: left;
  width: 45vw;
`;

const ClickableListItem = styled(ListItem)`
  &:hover {
    cursor: pointer;
  }
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
    const navigate = useNavigate();

    return (
      <StyledPopUp
        titleTx="job-details"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <SectionHeader tx={"annotations-generated"} />
        {isErrorAnnotations && (
          <Text>{`${t("annotations-loading-error")} ${
            annotationsError?.response?.statusText
          } (${annotationsError?.response?.status})`}</Text>
        )}
        {isLoadingAnnotations && <Text tx="annotations-loading" />}
        {annotations && (
          <List>
            {annotations?.map((annotation) => (
              <ClickableListItem
                onClick={() =>
                  navigate(editorPath(annotation.image, annotation.id))
                }
              >
                {annotation.dataUri}
              </ClickableListItem>
            ))}
          </List>
        )}
      </StyledPopUp>
    );
  },
);
