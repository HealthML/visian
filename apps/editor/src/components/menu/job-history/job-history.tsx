import { Box, Modal, Text, useTranslation } from "@visian/ui-shared";
import styled from "styled-components";

import { useJobs } from "../../../queries";
import { ProjectViewSwitch } from "../project-view-switch";
import { JobList } from "./job-list";

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 90vh;
  padding: 3%;
`;

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
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
    <Main>
      <StyledModal hideHeaderDivider={false} position="right">
        {isLoadingJobs && <Text tx="images-loading" />}
        {isErrorJobs && (
          <Text>{`${translate("images-loading-error")} ${
            jobsError?.response?.statusText
          } (${jobsError?.response?.status})`}</Text>
        )}
        <StyledProjectViewSwitch>
          <ProjectViewSwitch />
        </StyledProjectViewSwitch>
        {jobs && <JobList jobs={jobs} />}
      </StyledModal>
    </Main>
  );
};
