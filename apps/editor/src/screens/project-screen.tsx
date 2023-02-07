import { Box, Modal, Screen, Text, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";

import { DatasetList } from "../components/menu/dataset-list";
import { ProjectTab } from "../components/menu/project-tab";
import useDatasetsBy from "../queries/use-datasets-by";

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
          <ProjectTab />
          {datasets && <DatasetList datasets={datasets} />}
        </StyledModal>
      </Main>
    </Screen>
  );
});

export default ProjectScreen;
