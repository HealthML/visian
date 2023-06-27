import { useTranslation } from "@visian/ui-shared";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import useDatasetsBy, {
  useCreateDatasetMutation,
  useDeleteDatasetsForProjectMutation,
  useUpdateDatasetsMutation,
} from "../../../queries/use-datasets-by";
import { Dataset, Project } from "../../../types";
import { ConfirmationPopup } from "../confirmation-popup";
import { DatasetCreationPopup } from "../dataset-creation-popup";
import { EditPopup } from "../edit-popup";
import {
  PaddedPageSectionIconButton,
  PageSection,
  SectionSheet,
} from "../page-section";
import useLocalStorageToggle from "../util/use-local-storage";
import { GridView } from "../views/grid-view";
import { ListView } from "../views/list-view";

const Container = styled.div`
  display: flex;
  align-items: center;
`;

export const DatasetsSection = ({ project }: { project: Project }) => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  const { datasets, isLoadingDatasets, datasetsError } = useDatasetsBy(
    project.id,
  );
  const [datasetTobBeDeleted, setDatasetTobBeDeleted] = useState<Dataset>();
  const [datasetToBeUpdated, setDatasetToBeUpdated] = useState<Dataset>();
  const { deleteDatasets } = useDeleteDatasetsForProjectMutation();
  const { createDataset } = useCreateDatasetMutation();
  const updateDataset = useUpdateDatasetsMutation();

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

  // Open Dataset
  const openDataset = useCallback(
    (dataset: Dataset) => {
      navigate(`/datasets/${dataset.id}`);
    },
    [navigate],
  );

  // Edit Dataset
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const openEditPopup = useCallback(() => setIsEditPopupOpen(true), []);
  const closeEditPopup = useCallback(() => setIsEditPopupOpen(false), []);

  const editDataset = useCallback(
    (dataset: Dataset) => {
      setDatasetToBeUpdated(dataset);
      openEditPopup();
    },
    [setDatasetToBeUpdated, openEditPopup],
  );

  const confirmDeleteDataset = useCallback(() => {
    if (datasetTobBeDeleted)
      deleteDatasets({
        projectId: project.id,
        datasetIds: [datasetTobBeDeleted.id],
      });
  }, [datasetTobBeDeleted, deleteDatasets, project]);

  const confirmCreateDataset = useCallback(
    (newDatasetDto) => createDataset({ ...newDatasetDto, project: project.id }),
    [createDataset, project],
  );

  // Switch between List and Grid View
  const [isGridView, setIsGridView] = useLocalStorageToggle(
    "isGridViewDatasets",
    true,
  );
  const toggleGridView = useCallback(() => {
    setIsGridView((prev: boolean) => !prev);
  }, [setIsGridView]);

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
        <Container>
          <PaddedPageSectionIconButton
            icon={isGridView ? "list" : "grid"}
            tooltipTx={isGridView ? "switch-to-list" : "switch-to-grid"}
            tooltipPosition="right"
            onPointerDown={toggleGridView}
          />
          <PaddedPageSectionIconButton
            icon="plus"
            tooltipTx="create-dataset"
            tooltipPosition="left"
            onPointerDown={openCreateDatasetPopup}
          />
        </Container>
      }
    >
      <SectionSheet>
        {datasets &&
          (isGridView ? (
            <GridView
              data={datasets}
              imgSrc="../../assets/images/BraTS_Prev.png"
              onDelete={deleteDataset}
              onClick={openDataset}
              onEdit={editDataset}
            />
          ) : (
            <ListView
              data={datasets}
              onDelete={deleteDataset}
              onClick={openDataset}
              onEdit={editDataset}
            />
          ))}
      </SectionSheet>
      <ConfirmationPopup
        isOpen={isDeleteDatasetConfirmationPopUpOpen}
        onClose={closeDeleteDatasetConfirmationPopUp}
        message={translate("delete-dataset-message", {
          name: datasetTobBeDeleted?.name ?? "",
        })}
        titleTx="delete-dataset-title"
        onConfirm={confirmDeleteDataset}
      />
      <DatasetCreationPopup
        isOpen={isCreateDatasetPopupOpen}
        onClose={closeCreateDatasetPopup}
        onConfirm={confirmCreateDataset}
      />
      {datasetToBeUpdated && (
        <EditPopup
          oldName={datasetToBeUpdated.name}
          isOpen={isEditPopupOpen}
          onClose={closeEditPopup}
          onConfirm={(newName) =>
            updateDataset.mutate({ ...datasetToBeUpdated, name: newName })
          }
        />
      )}
    </PageSection>
  );
};
