import { Modal, SquareButton, Text, useTranslation } from "@visian/ui-shared";
import { useCallback, useState } from "react";
import styled from "styled-components";

import { useJobs } from "../../../queries";
import { ModelSelectionPopup } from "../ml-model-popup";
import { JobsTable } from "./job-table";

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
  position: relative;
  z-index: 49;
`;

const StyledButton = styled(SquareButton)`
  margin-left: 10px;
`;

export const JobHistory = ({ projectId }: { projectId: string }) => {
  const { jobs, jobsError, isErrorJobs, isLoadingJobs } = useJobs();

  const { t: translate } = useTranslation();

  // model selection popup
  const [isModelSelectionPopUpOpen, setIsModelSelectionPopUpOpen] =
    useState(false);
  const openModelSelectionPopUp = useCallback(() => {
    setIsModelSelectionPopUpOpen(true);
  }, []);
  const closeModelSelectionPopUp = useCallback(() => {
    setIsModelSelectionPopUpOpen(false);
  }, []);

  return (
    <StyledModal
      hideHeaderDivider={false}
      position="right"
      label="Job History"
      headerChildren={
        <StyledButton
          icon="plusSmall"
          onPointerDown={openModelSelectionPopUp}
        />
      }
    >
      {isLoadingJobs && <Text tx="jobs-loading" />}
      {isErrorJobs && (
        <Text>{`${translate("jobs-loading-error")} ${
          jobsError?.response?.statusText
        } (${jobsError?.response?.status})`}</Text>
      )}
      {jobs && <JobsTable jobs={jobs} />}
      <ModelSelectionPopup
        projectId={projectId}
        isOpen={isModelSelectionPopUpOpen}
        onClose={closeModelSelectionPopUp}
      />
    </StyledModal>
  );
};
