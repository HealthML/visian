import { Box, Modal, Text, useTranslation } from "@visian/ui-shared";
import styled from "styled-components";

import { useJobs } from "../../../queries";
import { ProjectViewSwitch } from "../project-view-switch";
import { JobList } from "./job-list";

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
  position: relative;
`;

const StyledProjectViewSwitch = styled(Box)`
  display flex;
  justify-content: center;
  width: 100%;
`;

export const JobHistory = () => {
  const { jobs, jobsError, isErrorJobs, isLoadingJobs } = useJobs();

  const { t: translate } = useTranslation();

  return (
    <StyledModal hideHeaderDivider={false} position="right">
      {isLoadingJobs && <Text tx="jobs-loading" />}
      {isErrorJobs && (
        <Text>{`${translate("jobs-loading-error")} ${
          jobsError?.response?.statusText
        } (${jobsError?.response?.status})`}</Text>
      )}
      {jobs && <JobList jobs={jobs} />}
    </StyledModal>
  );
};
