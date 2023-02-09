import { Box, Modal, Screen, Text, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";

import { DatasetList } from "../components/menu/dataset-list";
import { ProjectViewSwitch } from "../components/menu/project-view-switch";
import useDatasetsBy from "../queries/use-datasets-by";

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 90vh;
  padding: 3%;
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

export const ProjectScreen: React.FC = observer(() => {
  const projectId = useParams().projectId || "";

  const { datasets, datasetsError, isErrorDatasets, isLoadingDatasets } =
    useDatasetsBy(projectId);

  const { t: translate } = useTranslation();

  return (
    <Screen title={`${translate("project-base-title")}`}>
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
