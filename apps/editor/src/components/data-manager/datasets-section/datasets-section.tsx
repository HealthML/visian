import { useTranslation } from "@visian/ui-shared";
import { useCallback, useMemo, useState } from "react";

import useDatasetsBy, {
  useCreateDatasetMutation,
  useDeleteDatasetsForProjectMutation,
} from "../../../queries/use-datasets-by";
import { Dataset, Project } from "../../../types";
import { ConfirmationPopup } from "../confirmation-popup";
import { DatasetCreationPopup } from "../dataset-creation-popup";
import { DatasetList } from "../dataset-list";
import {
  PaddedPageSectionIconButton,
  PageSection,
  SectionSheet,
} from "../page-section";

export const DatasetsSection = ({ project }: { project: Project }) => {
  const { t: translate } = useTranslation();

  const { datasets, isLoadingDatasets, datasetsError } = useDatasetsBy(
    project.id,
  );
  const [datasetTobBeDeleted, setDatasetTobBeDeleted] = useState<Dataset>();
  const { deleteDatasets } = useDeleteDatasetsForProjectMutation();
  const { createDataset } = useCreateDatasetMutation();

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

  let datasetsInfoTx;
  if (datasetsError) datasetsInfoTx = "datasets-loading-failed";
  else if (datasets && datasets.length === 0)
    datasetsInfoTx = "no-datasets-available";

  return (
    <PageSection
      titleTx="datasets"
      isLoading={isLoadingDatasets}
      infoTx={datasetsInfoTx}
      showActions={!datasetsError}
      actions={
        <PaddedPageSectionIconButton
          icon="plus"
          tooltipTx="create-dataset"
          tooltipPosition="left"
          onPointerDown={openCreateDatasetPopup}
        />
      }
    >
      <SectionSheet>
        {datasets && (
          <DatasetList datasets={datasets} deleteDataset={deleteDataset} />
        )}
      </SectionSheet>
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
  );
};
