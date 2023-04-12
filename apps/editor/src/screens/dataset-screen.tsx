import {
  AbsoluteCover,
  Box,
  FloatingUIButton,
  Modal,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { DatasetExplorer } from "../components/menu/dataset-explorer";
import { useDataset } from "../queries";

const Container = styled(AbsoluteCover)`
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 55px;
`;

const ColumnLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 33.33%;
`;

const ColumnCenter = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  width: 33.33%;
`;

const ColumnRight = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 33.33%;
`;

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 85%;
  width: 85%;
  margin: auto;
`;

const MenuRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const LeftButton = styled(FloatingUIButton)`
  margin-right: 16px;
`;

const RightButton = styled(FloatingUIButton)`
  margin-left: 16px;
`;

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
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
      <TopBar>
        <ColumnLeft>
          <MenuRow>
            <LeftButton
              icon="home"
              tooltipTx="home"
              tooltipPosition="bottom"
              onPointerDown={() => navigate(`/projects`)}
              isActive={false}
            />
            <LeftButton
              icon="arrowBack"
              tooltipTx="back"
              tooltipPosition="bottom"
              onPointerDown={() => navigate(`/projects/${projectId}/datasets`)}
              isActive={false}
            />
          </MenuRow>
        </ColumnLeft>
        <ColumnCenter />
        <ColumnRight>
          <RightButton
            icon="pixelBrush"
            tooltipTx="open-editor"
            tooltipPosition="left"
            onPointerDown={() => navigate(`/editor`)}
            isActive={false}
          />
        </ColumnRight>
      </TopBar>
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
