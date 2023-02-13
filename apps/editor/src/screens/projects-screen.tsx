import { Box, Modal, Screen, Text, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";

import { ProjectList } from "../components/menu/projects-list/project-list";
import { useProjects } from "../queries";

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 100%;
  padding: 5rem 10rem;
  padding-top: 4rem;
`;

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
`;

export const ProjectsScreen: React.FC = observer(() => {
  const { projects, projectsError, isErrorProjects, isLoadingProjects } =
    useProjects();
  const { t: translate } = useTranslation();

  return (
    <Screen title={`${translate("projects-base-title")}`}>
      <Main>
        {isLoadingProjects && <StyledModal labelTx="projects-loading" />}
        {isErrorProjects && (
          <StyledModal labelTx="error">
            <Text>{`${translate("projects-loading-error")} ${
              projectsError?.response?.statusText
            } (${projectsError?.response?.status})`}</Text>
          </StyledModal>
        )}
        <StyledModal>
          {projects && <ProjectList projects={projects} />}
        </StyledModal>
      </Main>
    </Screen>
  );
});

export default ProjectsScreen;
