import { Modal, Notification, SquareButton, Text } from "@visian/ui-shared";
import { useCallback, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { useJobsByProject } from "../../../queries";
import { JobCreationPopup } from "../job-creation-popup";
import { JobsTable } from "./job-table";

const StyledModal = styled(Modal)`
  width: 100%;
`;

const ErrorMessage = styled(Text)`
  margin: auto;
`;

const StyledButton = styled(SquareButton)`
  margin-left: 10px;
  padding: 10px;
`;

const ErrorNotification = styled(Notification)`
  position: absolute;
  min-width: 30%;
  left: 50%;
  bottom: 15%;
  transform: translateX(-50%);
`;

export const JobHistory = ({
  projectId,
  altMessage,
}: {
  projectId: string;
  altMessage: string;
}) => {
  const store = useStore();

  const { data: jobs, refetch: refetchJobs } = useJobsByProject(projectId);

  // Model selection popup
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
      labelTx="jobs-base-title"
      headerChildren={
        <StyledButton icon="plus" onPointerDown={openModelSelectionPopUp} />
      }
    >
      {store?.error && (
        <ErrorNotification
          title={store?.error.title}
          titleTx={store?.error.titleTx}
          description={store?.error.description}
          descriptionTx={store?.error.descriptionTx}
          descriptionData={store?.error.descriptionData}
        />
      )}
      {altMessage ? (
        <ErrorMessage text={altMessage} />
      ) : (
        jobs && <JobsTable jobs={jobs} />
      )}
      <JobCreationPopup
        projectId={projectId}
        isOpen={isModelSelectionPopUpOpen}
        onClose={closeModelSelectionPopUp}
        refetchJobs={refetchJobs}
      />
    </StyledModal>
  );
};
