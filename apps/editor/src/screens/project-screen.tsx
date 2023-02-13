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

import { DatasetList } from "../components/menu/dataset-list";
import { ProjectViewSwitch } from "../components/menu/project-view-switch";
import useDatasetsBy from "../queries/use-datasets-by";

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

const StyledProjectViewSwitch = styled(Box)`
  display flex;
  justify-content: center;
  width: 100%;
`;

const IconButton = styled(InvisibleButton)`
  width: 40px;
  margin: 5px;
`;

export const ProjectScreen: React.FC = observer(() => {
  const projectId = useParams().projectId || "";

  const { datasets, datasetsError, isErrorDatasets, isLoadingDatasets } =
    useDatasetsBy(projectId);

  const navigate = useNavigate();
  const { t: translate } = useTranslation();

  return (
    <Screen title={`${translate("project-base-title")}`}>
      <IconButton icon="menu" onPointerDown={() => navigate(`/project`)} />
      <Main>
        {isLoadingDatasets && <StyledModal labelTx="project-loading" />}
        {isErrorDatasets && (
          <StyledModal labelTx="error">
            <Text>{`${translate("project-loading-error")} ${
              datasetsError?.response?.statusText
            } (${datasetsError?.response?.status})`}</Text>
          </StyledModal>
        )}
        <StyledModal>
          <StyledProjectViewSwitch>
            <ProjectViewSwitch />
          </StyledProjectViewSwitch>
          {datasets && <DatasetList datasets={datasets} />}
        </StyledModal>
      </Main>
    </Screen>
  );
});

export default ProjectScreen;
