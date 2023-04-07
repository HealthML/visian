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
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { ProjectList } from "../components/menu/projects-list/project-list";
import { useProjects } from "../queries";

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

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 85%;
  width: 85%;
  margin: auto;
`;

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
`;

const ColumnLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 33.33%;
`;

const MenuRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const LeftButton = styled(FloatingUIButton)`
  margin-right: 16px;
`;

export const ProjectsScreen: React.FC = observer(() => {
  const { projects, projectsError, isErrorProjects, isLoadingProjects } =
    useProjects();
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  return (
    <Container title={`${translate("projects-base-title")}`}>
      <TopBar>
        <ColumnLeft>
          <MenuRow>
            <LeftButton
              icon="pixelBrush"
              tooltipTx="open-editor"
              tooltipPosition="bottom"
              onPointerDown={() => navigate(`/editor`)}
              isActive={false}
            />
          </MenuRow>
        </ColumnLeft>
      </TopBar>
      <Main>
        {isLoadingProjects ? (
          <StyledModal labelTx="projects-loading" />
        ) : isErrorProjects ? (
          <StyledModal labelTx="error">
            <Text>{`${translate("projects-loading-error")} ${
              projectsError?.response?.statusText
            } (${projectsError?.response?.status})`}</Text>
          </StyledModal>
        ) : (
          <StyledModal>
            {projects && projects.length > 0 ? (
              <ProjectList projects={projects} />
            ) : (
              <Text>{translate("no-projects-available")}</Text>
            )}
          </StyledModal>
        )}
      </Main>
    </Container>
  );
});

export default ProjectsScreen;
