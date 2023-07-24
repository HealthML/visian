import { MiaJob } from "@visian/mia-api";
import { Divider, PopUp, SectionHeader, Text } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { jobsApi } from "../../../../queries";
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

const getLogText = async (job: MiaJob) => {
  let logText = "";
  if (job.logFileUri) {
    try {
      logText = await jobsApi
        .jobsControllerGetFile(job.id, { responseType: "text" })
        .then((response) => response.data as unknown as string);
    } catch (e) {
      logText = "Error fetching job log file";
    }
  }
  return logText;
};

export const JobLogPopup = observer<JobLogPopUpProps>(
  ({ isOpen, onClose, job }) => {
    const [jobLogContent, setjobLogContent] = useState("");

    useEffect(() => {
      getLogText(job).then((text) => setjobLogContent(text));
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
