import { Modal, Text, useTranslation } from "@visian/ui-shared";
import styled from "styled-components";

import { useJobs } from "../../../querys";
import { JobList } from "./job-list";

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
  height: 50%;
  z-index: 49;
`;

export const JobHistory = () => {
  const { jobs, jobsError, isErrorJobs, isLoadingJobs } = useJobs();

  const { t: translate } = useTranslation();

  return (
    <StyledModal
      hideHeaderDivider={false}
      position="right"
      //   headerChildren={
      //     <JobsListHeader/>
      //   }
    >
      {isLoadingJobs && <Text tx="images-loading" />}
      {isErrorJobs && (
        <Text>{`${translate("images-loading-error")} ${
          jobsError?.response?.statusText
        } (${jobsError?.response?.status})`}</Text>
      )}
      {jobs && <JobList jobs={jobs} />}
    </StyledModal>
  );
};
