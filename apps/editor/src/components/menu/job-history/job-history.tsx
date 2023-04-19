import { Modal, Text, useTranslation } from "@visian/ui-shared";
import styled from "styled-components";

import useJobsBy from "../../../queries/use-jobs-by";
import { JobsTable } from "./job-table";

const StyledModal = styled(Modal)`
  width: 100%;
`;

export const JobHistory = ({ projectId }: { projectId: string }) => {
  const { jobs, jobsError, isErrorJobs, isLoadingJobs } = useJobsBy(projectId);
  const { t: translate } = useTranslation();

  return isLoadingJobs || isErrorJobs ? (
    <StyledModal title={isLoadingJobs ? "jobs-loading" : "error"}>
      {isLoadingJobs ? (
        <Text>{translate("jobs-loading")}</Text>
      ) : (
        <Text>
          {`${translate("jobs-loading-error")} ${
            jobsError?.response?.statusText
          } (${jobsError?.response?.status})`}
        </Text>
      )}
    </StyledModal>
  ) : (
    <StyledModal>
      {jobs && jobs.length > 0 ? (
        <JobsTable jobs={jobs} />
      ) : (
        <Text>{translate("no-jobs-available")}</Text>
      )}
    </StyledModal>
  );
};
