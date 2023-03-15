import {
  Box,
  FloatingUIButton,
  Modal,
  Screen,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { DatasetExplorer } from "../components/menu/dataset-explorer";
import { useDataset } from "../queries";

const Container = styled(Screen)`
  padding: 20px;
`;

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 100%;
  padding: 1rem 10rem 5rem;
`;

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
`;

const IconButton = styled(FloatingUIButton)`
  margin-right: 16px;
`;

const MenuRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

export const DatasetScreen: React.FC = observer(() => {
  const datasetId = useParams().datasetId || "";
  const projectId = useParams().projectId || "";

  const { dataset, datasetError, isErrorDataset, isLoadingDataset } =
    useDataset(datasetId);

  const navigate = useNavigate();
  const { t: translate } = useTranslation();

  return (
    <Container
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
      <MenuRow>
        <IconButton
          icon="home"
          tooltipTx="Home"
          onPointerDown={() => navigate(`/projects`)}
          isActive={false}
        />
        <IconButton
          icon="arrowBack"
          tooltipTx="Back"
          onPointerDown={() => navigate(`/projects/${projectId}/datasets`)}
          isActive={false}
        />
      </MenuRow>
      <Main>
        {isLoadingDataset && <StyledModal labelTx="dataset-loading" />}
        {isErrorDataset && (
          <StyledModal labelTx="error">
            <Text>{`${translate("dataset-loading-error")} ${
              datasetError?.response?.statusText
            } (${datasetError?.response?.status})`}</Text>
          </StyledModal>
        )}
        {dataset && <DatasetExplorer dataset={dataset} />}
      </Main>
    </Container>
  );
});

export default DatasetScreen;
