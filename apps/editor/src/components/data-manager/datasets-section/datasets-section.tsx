import { useTranslation } from "@visian/ui-shared";
import { MiaDataset, MiaProject } from "@visian/utils";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import useDatasetsBy, {
  useCreateDatasetMutation,
  useDeleteDatasetsForProjectMutation,
  useUpdateDatasetsMutation,
} from "../../../queries/use-datasets-by";
import { ConfirmationPopup } from "../confirmation-popup";
import { DatasetCreationPopup } from "../dataset-creation-popup";
import { EditPopup } from "../edit-popup";
import { PaddedPageSectionIconButton, PageSection } from "../page-section";
import useLocalStorageToggle from "../util/use-local-storage";
import { GridView } from "../views/grid-view";
import { ListView } from "../views/list-view";

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const StyledIconButton = styled(PaddedPageSectionIconButton)`
  height: 25px;
`;

export const DatasetsSection = ({ project }: { project: MiaProject }) => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  const { datasets, isLoadingDatasets, datasetsError } = useDatasetsBy(
    project.id,
  );
  const [datasetTobBeDeleted, setDatasetTobBeDeleted] = useState<MiaDataset>();
  const [datasetToBeUpdated, setDatasetToBeUpdated] = useState<MiaDataset>();
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
    (dataset: MiaDataset) => {
      setDatasetTobBeDeleted(dataset);
      openDeleteDatasetConfirmationPopUp();
    },
    [setDatasetTobBeDeleted, openDeleteDatasetConfirmationPopUp],
  );

  // Open Dataset
  const openDataset = useCallback(
    (dataset: MiaDataset) => {
      navigate(`/datasets/${dataset.id}`);
    },
    [navigate],
  );

  // Edit Dataset
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const openEditPopup = useCallback(() => setIsEditPopupOpen(true), []);
  const closeEditPopup = useCallback(() => setIsEditPopupOpen(false), []);

  const editDataset = useCallback(
    (dataset: MiaDataset) => {
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
          <StyledIconButton
            icon={isGridView ? "list" : "grid"}
            tooltipTx={isGridView ? "switch-to-list" : "switch-to-grid"}
            tooltipPosition="right"
            onPointerDown={toggleGridView}
          />
          <StyledIconButton
            icon="plus"
            tooltipTx="create-dataset"
            tooltipPosition="left"
            onClick={openCreateDatasetPopup}
          />
        </Container>
      }
    >
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
