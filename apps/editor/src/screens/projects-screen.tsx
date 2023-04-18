import {
  AbsoluteCover,
  Box,
  FloatingUIButton,
  Modal,
  SquareButton,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { ConfirmationPopup } from "../components/menu/confimration-popup";
import { ProjectList } from "../components/menu/projects-list/project-list";
import { useDeleteProjectsMutation, useProjects } from "../queries";
import { Project } from "../types";

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
  z-index: 49;
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

const RightButton = styled(FloatingUIButton)`
  margin-left: 16px;
`;

const StyledButton = styled(SquareButton)`
  margin-left: 10px;
`;

export const ProjectsScreen: React.FC = observer(() => {
  const { projects, projectsError, isErrorProjects, isLoadingProjects } =
    useProjects();
  const [areControlsEnabled, setAreControlsEnabled] = useState(false);
  const [projectTobBeDeleted, setProjectTobBeDeleted] = useState<Project>();
  const { deleteProjects } = useDeleteProjectsMutation();
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  // delete annotation confirmation popup
  const [
    isDeleteProjectConfirmationPopUpOpen,
    setIsDeleteProjectConfirmationPopUpOpen,
  ] = useState(false);
  const openDeleteProjectConfirmationPopUp = useCallback(() => {
    setIsDeleteProjectConfirmationPopUpOpen(true);
  }, []);
  const closeDeleteProjectConfirmationPopUp = useCallback(() => {
    setIsDeleteProjectConfirmationPopUpOpen(false);
  }, []);

  const deleteProject = useCallback(
    (project: Project) => {
      setProjectTobBeDeleted(project);
      openDeleteProjectConfirmationPopUp();
    },
    [setProjectTobBeDeleted, openDeleteProjectConfirmationPopUp],
  );

  const deleteProjectMessage = useMemo(
    () =>
      `${translate("delete-project-message")}`.replace(
        "_",
        projectTobBeDeleted?.name ?? "",
      ),
    [projectTobBeDeleted, translate],
  );

  return (
    <Container title={`${translate("projects-base-title")}`}>
      <TopBar>
        <ColumnLeft />
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
        {isLoadingProjects ? (
          <StyledModal labelTx="projects-loading" />
        ) : isErrorProjects ? (
          <StyledModal labelTx="error">
            <Text>{`${translate("projects-loading-error")} ${
              projectsError?.response?.statusText
            } (${projectsError?.response?.status})`}</Text>
          </StyledModal>
        ) : (
          <StyledModal
            hideHeaderDivider={false}
            labelTx="projects-base-title"
            position="right"
          >
            {projects && projects.length > 0 ? (
              <ProjectList projects={projects} deleteProject={deleteProject} />
            ) : (
              <Text>{translate("no-projects-available")}</Text>
            )}
            <ConfirmationPopup
              isOpen={isDeleteProjectConfirmationPopUpOpen}
              onClose={closeDeleteProjectConfirmationPopUp}
              message={deleteProjectMessage}
              titleTx="delete-project-title"
              onConfirm={() => {
                if (projectTobBeDeleted)
                  deleteProjects({
                    projectIds: [projectTobBeDeleted.id],
                  });
              }}
            />
          </StyledModal>
        )}
      </Main>
    </Container>
  );
});

export default ProjectsScreen;
