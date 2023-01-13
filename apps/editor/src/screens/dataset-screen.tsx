import { Box, Modal, Screen, Text } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { ReactQueryDevtools } from "react-query/devtools";
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

  return (
    <Screen
      title={
        isLoadingDataset
          ? "VISIAN Dataset loading..."
          : isErrorDataset
          ? "VISIAN Dataset Error!"
          : dataset
          ? `VISIAN Dataset: ${dataset.name}`
          : "VISIAN Dataset"
      }
    >
      <Main>
        {isLoadingDataset && <StyledModal label="Loading Dataset..." />}
        {isErrorDataset && (
          <StyledModal label="Error!">
            <Text>{`Error on loading Dataset: ${datasetError?.message}`}</Text>
          </StyledModal>
        )}
        {dataset && <DatasetModal dataset={dataset} />}
      </Main>
      {false && <ReactQueryDevtools initialIsOpen={false} />}
    </Screen>
  );
});

export default DatasetScreen;
