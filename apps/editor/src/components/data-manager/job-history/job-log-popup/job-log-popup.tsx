import { Divider, PopUp, SectionHeader, Text } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { getJobLogText } from "../../../../queries";
import { JobLogPopUpProps } from "./job-log-popup.props";

const PopUpContainer = styled(PopUp)`
  align-items: left;
  width: 70%;
  max-height: 80%;
`;

const StyledDivider = styled(Divider)`
  margin-top: 0.5em;
`;

const StyledText = styled(Text)`
  overflow-y: auto;
  white-space: pre-wrap;
`;

export const JobLogPopup = observer<JobLogPopUpProps>(
  ({ isOpen, onClose, job }) => {
    const [jobLogContent, setjobLogContent] = useState("");

    useEffect(() => {
      const fetchLogText = async () => {
        const text = await getJobLogText(job);
        setjobLogContent(text);
      };

      fetchLogText();
    }, [job, isOpen]);

    return (
      <PopUpContainer
        titleTx="job-log"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <SectionHeader>{job.logFileUri}</SectionHeader>
        <StyledDivider />
        <StyledText>{jobLogContent}</StyledText>
      </PopUpContainer>
    );
  },
);
