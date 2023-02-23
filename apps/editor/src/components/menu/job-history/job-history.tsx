import { Box, Modal, Text, useTranslation } from "@visian/ui-shared";
import styled from "styled-components";

import { useJobs } from "../../../queries";
import { JobsTable } from "./job-list";

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
  position: relative;
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
      {jobs && <JobsTable jobs={jobs} />}
    </StyledModal>
  );
};
