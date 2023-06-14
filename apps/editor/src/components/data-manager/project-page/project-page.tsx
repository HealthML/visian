import { Sheet, space, useTranslation } from "@visian/ui-shared";
import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { useJobsBy } from "../../../queries";
import useDatasetsBy, {
  useCreateDatasetMutation,
  useDeleteDatasetsForProjectMutation,
} from "../../../queries/use-datasets-by";
import { Dataset, Project } from "../../../types";
import { ConfirmationPopup } from "../confirmation-popup";
import { DatasetCreationPopup } from "../dataset-creation-popup";
import { DatasetList } from "../dataset-list";
import { JobCreationPopup } from "../job-creation-popup";
import { JobsTable } from "../job-history/job-table";
import { PageSection, PageSectionIconButton } from "../page-section";
import { PageTitle } from "../page-title";

const StyledSheet = styled(Sheet)`
  padding: ${space("pageSectionMarginSmall")};
  box-sizing: border-box;
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const PlusIconButton = styled(PageSectionIconButton)`
  padding: 0 8px;
  height: auto;
`;

export const ProjectPage = ({ project }: { project: Project }) => {
  const { t: translate } = useTranslation();

  const { datasets, isLoadingDatasets, datasetsError } = useDatasetsBy(
    project.id,
  );
  const [datasetTobBeDeleted, setDatasetTobBeDeleted] = useState<Dataset>();
  const { deleteDatasets } = useDeleteDatasetsForProjectMutation();
  const { createDataset } = useCreateDatasetMutation();

  const { jobs, jobsError, isLoadingJobs, refetchJobs } = useJobsBy(project.id);

  // Delete Dataset Confirmation
  const [
    isDeleteDatasetConfirmationPopUpOpen,
    setIsDeleteDatasetConfirmationPopUpOpen,
  ] = useState(false);
  const openDeleteDatasetConfirmationPopUp = useCallback(() => {
    setIsDeleteDatasetConfirmationPopUpOpen(true);
  }, []);
  const closeDeleteDatasetConfirmationPopUp = useCallback(() => {
    setIsDeleteDatasetConfirmationPopUpOpen(false);
  }, []);

  // Create Dataset
  const [isCreateDatasetPopupOpen, setIsCreateDatasetPopupOpen] =
    useState(false);
  const openCreateDatasetPopup = useCallback(
    () => setIsCreateDatasetPopupOpen(true),
    [],
  );
  const closeCreateDatasetPopup = useCallback(
    () => setIsCreateDatasetPopupOpen(false),
    [],
  );

  // Delete Dataset
  const deleteDataset = useCallback(
    (dataset: Dataset) => {
      setDatasetTobBeDeleted(dataset);
      openDeleteDatasetConfirmationPopUp();
    },
    [setDatasetTobBeDeleted, openDeleteDatasetConfirmationPopUp],
  );
  const deleteDatasetMessage = useMemo(
    () =>
      `${translate("delete-dataset-message")}`.replace(
        "_",
        datasetTobBeDeleted?.name ?? "",
      ),
    [datasetTobBeDeleted, translate],
  );

  // Jobs
  const [isModelSelectionPopUpOpen, setIsModelSelectionPopUpOpen] =
    useState(false);
  const openModelSelectionPopUp = useCallback(() => {
    setIsModelSelectionPopUpOpen(true);
  }, []);
  const closeModelSelectionPopUp = useCallback(() => {
    setIsModelSelectionPopUpOpen(false);
  }, []);

  let datasetsInfoTx;
  if (datasetsError) datasetsInfoTx = "datasets-loading-failed";
  else if (datasets && datasets.length === 0)
    datasetsInfoTx = "no-datasets-available";

  let jobsInfoTx;
  if (jobsError) jobsInfoTx = "jobs-loading-failed";
  else if (jobs && jobs.length === 0) jobsInfoTx = "no-jobs-available";

  return (
    <Container>
      <PageTitle title={project.name} labelTx="project" backPath="/projects" />
      <PageSection
        titleTx="datasets"
        isLoading={isLoadingDatasets}
        infoTx={datasetsInfoTx}
        showActions={!datasetsError}
        actions={
          <PlusIconButton
            icon="plus"
            tooltipTx="create-dataset"
            tooltipPosition="left"
            onPointerDown={openCreateDatasetPopup}
          />
        }
      >
        <StyledSheet>
          {datasets && (
            <DatasetList datasets={datasets} deleteDataset={deleteDataset} />
          )}
        </StyledSheet>
        <ConfirmationPopup
          isOpen={isDeleteDatasetConfirmationPopUpOpen}
          onClose={closeDeleteDatasetConfirmationPopUp}
          message={deleteDatasetMessage}
          titleTx="delete-dataset-title"
          onConfirm={() => {
            if (datasetTobBeDeleted)
              deleteDatasets({
                projectId: project.id,
                datasetIds: [datasetTobBeDeleted.id],
              });
          }}
        />
        <DatasetCreationPopup
          isOpen={isCreateDatasetPopupOpen}
          onClose={closeCreateDatasetPopup}
          onConfirm={(newDatasetDto) =>
            createDataset({ ...newDatasetDto, project: project.id })
          }
        />
      </PageSection>
      <PageSection
        titleTx="jobs"
        isLoading={isLoadingJobs}
        infoTx={jobsInfoTx}
        showActions={!jobsError}
        actions={
          <PlusIconButton
            icon="plus"
            tooltipTx="start-job"
            tooltipPosition="left"
            onPointerDown={openModelSelectionPopUp}
          />
        }
      >
        <StyledSheet>{jobs && <JobsTable jobs={jobs} />}</StyledSheet>
        <JobCreationPopup
          projectId={project.id}
          isOpen={isModelSelectionPopUpOpen}
          onClose={closeModelSelectionPopUp}
          refetchJobs={refetchJobs}
        />
      </PageSection>
    </Container>
  );
};
