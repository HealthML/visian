import { Modal, Text, useTranslation } from "@visian/ui-shared";
import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import useDatasetsBy, {
  useDeleteDatasetsForProjectMutation,
} from "../../../queries/use-datasets-by";
import { Dataset } from "../../../types";
import { ConfirmationPopup } from "../confirmation-popup";
import { DatasetList } from "../dataset-list";

const StyledModal = styled(Modal)`
  width: 100%;
`;

const ErrorMessage = styled(Text)`
  margin: auto;
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

  if (altMessage) {
    return (
      <StyledModal>
        <ErrorMessage tx={altMessage} />
      </StyledModal>
    );
  }

  return (
    <>
      <StyledModal>
        {datasets && (
          <DatasetList datasets={datasets} deleteDataset={deleteDataset} />
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
    </>
  );
};
