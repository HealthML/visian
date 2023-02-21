import {
  Box,
  InvisibleButton,
  Modal,
  Screen,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { DatasetModal } from "../components/menu/dataset-modal";
import { useDataset } from "../queries";

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 100%;
  padding: 1rem 10rem;
  padding-bottom: 5rem;
`;

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
`;

const IconButton = styled(InvisibleButton)`
  width: 40px;
  margin: 5px;
`;

export const DatasetScreen: React.FC = observer(() => {
  const datasetId = useParams().datasetId || "";

  const { dataset, datasetError, isErrorDataset, isLoadingDataset } =
    useDataset(datasetId);

  const navigate = useNavigate();
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
      <IconButton icon="menu" onPointerDown={() => navigate(`/projects`)} />
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
