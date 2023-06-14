import { Modal, SquareButton, Text, useTranslation } from "@visian/ui-shared";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import useDatasetsBy, {
  useCreateDatasetMutation,
  useDeleteDatasetsForProjectMutation,
} from "../../../queries/use-datasets-by";
import { Dataset } from "../../../types";
import { ConfirmationPopup } from "../confirmation-popup";
import { DatasetCreationPopup } from "../dataset-creation-popup";
import { GridView } from "../grid-view";
import { ListView } from "../list-view";
import useLocalStorageToggle from "../util/use-local-storage";

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

export const DatasetsGrid = ({
  projectId,
  altMessage,
}: {
  projectId: string;
  altMessage: string;
}) => {
  const { datasets } = useDatasetsBy(projectId);
  const [datasetTobBeDeleted, setDatasetTobBeDeleted] = useState<Dataset>();
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { deleteDatasets } = useDeleteDatasetsForProjectMutation();
  const { createDataset } = useCreateDatasetMutation();

  // delete dataset confirmation popup
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

  // create dataset popup
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

  const openDataset = useCallback(
    (dataset: Dataset) => {
      navigate(`/datasets/${dataset.id}`);
    },
    [navigate],
  );

  // switch between list and grid view
  const [isGridView, setIsGridView] = useLocalStorageToggle(
    "isGridViewDatasets",
    true,
  );
  const toggleGridView = useCallback(() => {
    setIsGridView((prev: boolean) => !prev);
  }, [setIsGridView]);

  return (
    <>
      <StyledModal
        hideHeaderDivider={false}
        labelTx="datasets-base-title"
        position="right"
        headerChildren={
          <>
            <StyledButton
              icon="plus"
              tooltipTx="create-dataset"
              tooltipPosition="left"
              onPointerDown={openCreateDatasetPopup}
            />
            <StyledButton
              icon={isGridView ? "list" : "grid"}
              tooltipTx={isGridView ? "switch-to-list" : "switch-to-grid"}
              tooltipPosition="right"
              onPointerDown={toggleGridView}
            />
          </>
        }
      >
        {altMessage ? (
          <ErrorMessage tx={altMessage} />
        ) : (
          datasets &&
          (isGridView ? (
            <GridView
              data={datasets}
              imgSrc="../../assets/images/walnut.png"
              onDelete={deleteDataset}
              onClick={openDataset}
            />
          ) : (
            <ListView
              data={datasets}
              onDelete={deleteDataset}
              onClick={openDataset}
            />
          ))
        )}
      </StyledModal>
      <ConfirmationPopup
        isOpen={isDeleteDatasetConfirmationPopUpOpen}
        onClose={closeDeleteDatasetConfirmationPopUp}
        message={deleteDatasetMessage}
        titleTx="delete-dataset-title"
        onConfirm={() => {
          if (datasetTobBeDeleted)
            deleteDatasets({
              projectId,
              datasetIds: [datasetTobBeDeleted.id],
            });
        }}
      />
      <DatasetCreationPopup
        isOpen={isCreateDatasetPopupOpen}
        onClose={closeCreateDatasetPopup}
        onConfirm={(newDatasetDto) =>
          createDataset({ ...newDatasetDto, project: projectId })
        }
      />
    </>
  );
};
