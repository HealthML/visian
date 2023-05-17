import { Divider, PopUp, SectionHeader, Text } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import styled from "styled-components";

import { getJobLog } from "../../../../queries";
import { Job } from "../../../../types";
import { JobLogPopUpProps } from "./job-log-popup.props";

const PopUpContainer = styled(PopUp)`
  align-items: left;
  width: 70%;
`;

const StyledDivider = styled(Divider)`
  margin-top: 0.5em;
`;

const getLogText = async (job: Job) => {
  let logText = "";
  if (job.logFileUri) {
    try {
      logText = await getJobLog(job.id);
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
        title="Job Log"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <SectionHeader>{job.logFileUri}</SectionHeader>
        <StyledDivider />
        <Text style={{ whiteSpace: "pre-wrap" }}>{jobLogContent}</Text>
      </PopUpContainer>
    );
  },
);
