import { Modal, SquareButton, Text, useTranslation } from "@visian/ui-shared";
import { useCallback, useState } from "react";
import styled from "styled-components";

import useDatasetsBy, {
  useCreateDatasetMutation,
  useDeleteDatasetsForProjectMutation,
} from "../../../queries/use-datasets-by";
import { Dataset } from "../../../types";
import { ConfirmationPopup } from "../confirmation-popup";
import { DatasetCreationPopup } from "../dataset-creation-popup";
import { DatasetList } from "../dataset-list";

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
  const { deleteDatasets } = useDeleteDatasetsForProjectMutation();
  const { createDataset } = useCreateDatasetMutation();

  // Delete dataset confirmation popup
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

  // Create dataset popup
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

  return (
    <>
      <StyledModal
        hideHeaderDivider={false}
        labelTx="datasets-base-title"
        position="right"
        headerChildren={
          <StyledButton
            icon="plus"
            tooltipTx="create-dataset"
            tooltipPosition="left"
            onPointerDown={openCreateDatasetPopup}
          />
        }
      >
        {altMessage ? (
          <ErrorMessage tx={altMessage} />
        ) : (
          datasets && (
            <DatasetList datasets={datasets} deleteDataset={deleteDataset} />
          )
        )}
      </StyledModal>
      <ConfirmationPopup
        isOpen={isDeleteDatasetConfirmationPopUpOpen}
        onClose={closeDeleteDatasetConfirmationPopUp}
        message={translate("delete-dataset-message", {
          name: datasetTobBeDeleted?.name ?? "",
        })}
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
