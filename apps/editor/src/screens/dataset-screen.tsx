import { Box, Modal, Screen, Text, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";

import { DatasetModal } from "../components/menu/dataset-modal";
import { useDataset } from "../querys";

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 100%;
  padding: 5rem 10rem;
`;

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
`;

const datasetId = "2f7c3aaf-6008-4537-9ab2-3893b16a67f6";

export const DatasetScreen: React.FC = observer(() => {
  const { dataset, datasetError, isErrorDataset, isLoadingDataset } =
    useDataset(datasetId);

  const { t: translate } = useTranslation();

  return (
    <Screen
      title={`${translate("dataset-base-title")} ${
        isLoadingDataset
          ? translate("loading")
          : isErrorDataset
          ? translate("error")
          : dataset
          ? dataset.name
          : ""
      }`}
    >
      <Main>
        {isLoadingDataset && <StyledModal labelTx="dataset-loading" />}
        {isErrorDataset && (
          <StyledModal labelTx="error">
            <Text>{`${translate("dataset-loading-error")} ${
              datasetError?.response?.statusText
            } (${datasetError?.response?.status})`}</Text>
          </StyledModal>
        )}
        {dataset && <DatasetModal dataset={dataset} />}
      </Main>
    </Screen>
  );
});

export default DatasetScreen;
