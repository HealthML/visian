import { MiaProject } from "@visian/mia-api";
import { useCallback, useState } from "react";
import styled from "styled-components";

import { useJobsByProject } from "../../../queries";
import { JobCreationPopup } from "../job-creation-popup";
import { JobsTable } from "../job-history/job-table";
import {
  PaddedPageSectionIconButton,
  PageSection,
  SectionSheet,
} from "../page-section";

const StyledIconButton = styled(PaddedPageSectionIconButton)`
  height: 25px;
`;

export const JobsSection = ({ project }: { project: MiaProject }) => {
  const {
    data: jobs,
    error: jobsError,
    isLoading: isLoadingJobs,
    refetch: refetchJobs,
  } = useJobsByProject(project.id);

  // Jobs
  const [isModelSelectionPopUpOpen, setIsModelSelectionPopUpOpen] =
    useState(false);
  const openModelSelectionPopUp = useCallback(() => {
    setIsModelSelectionPopUpOpen(true);
  }, []);
  const closeModelSelectionPopUp = useCallback(() => {
    setIsModelSelectionPopUpOpen(false);
  }, []);

  let jobsInfoTx;
  if (jobsError) jobsInfoTx = "jobs-loading-failed";
  else if (jobs && jobs.length === 0) jobsInfoTx = "no-jobs-available";

  return (
    <PageSection
      titleTx="jobs"
      isLoading={isLoadingJobs}
      infoTx={jobsInfoTx}
      showActions={!jobsError}
      actions={
        <StyledIconButton
          icon="plus"
          tooltipTx="start-job"
          tooltipPosition="left"
          onPointerDown={openModelSelectionPopUp}
        />
      }
    >
      <SectionSheet>{jobs && <JobsTable jobs={jobs} />}</SectionSheet>
      <JobCreationPopup
        projectId={project.id}
        isOpen={isModelSelectionPopUpOpen}
        onClose={closeModelSelectionPopUp}
        refetchJobs={refetchJobs}
      />
    </PageSection>
  );
};
