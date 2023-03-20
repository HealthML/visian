import { Modal, Text, useTranslation } from "@visian/ui-shared";
import styled from "styled-components";

import useJobsBy from "../../../queries/use-jobs-by";
import { JobsTable } from "./job-table";

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100vw;
  position: relative;
  z-index: 49;
`;
// TODO: z-index logic

export const JobHistory = ({ projectId }: { projectId: string }) => {
  const { jobs, jobsError, isErrorJobs, isLoadingJobs } = useJobsBy(projectId);

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
