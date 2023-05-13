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
  width: 100100%;
`;

export const DatasetsGrid = ({ projectId }: { projectId: string }) => {
  const { datasets, datasetsError, isErrorDatasets, isLoadingDatasets } =
    useDatasetsBy(projectId);
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

  return (
    <>
      {isLoadingDatasets || isErrorDatasets ? (
        <StyledModal title={isLoadingDatasets ? "datasets-loading" : "error"}>
          {isLoadingDatasets ? (
            <Text>{translate("datasets-loading")}</Text>
          ) : (
            <Text>
              {`${translate("datasets-loading-error")} ${
                datasetsError?.response?.statusText
              } (${datasetsError?.response?.status})`}
            </Text>
          )}
        </StyledModal>
      ) : (
        <StyledModal>
          {datasets && datasets.length > 0 ? (
            <DatasetList datasets={datasets} deleteDataset={deleteDataset} />
          ) : (
            <Text>{translate("no-datasets-available")}</Text>
          )}
        </StyledModal>
      )}
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
