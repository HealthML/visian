import { PopUp } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { Job } from "../../../../types";
import { JobDetailsPopUpProps } from "./job-details-popup.props";

const StyledPopUp = styled(PopUp)`
  align-items: left;
  width: 45vw;
`;

export const JobDetailsPopUp = observer<JobDetailsPopUpProps>(
  ({ job, isOpen, onClose }) => {
    return (
      <StyledPopUp
        titleTx="job-details"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      ></StyledPopUp>
    );
  },
);
