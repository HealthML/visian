import { Screen, Sheet, space, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { ConfirmationPopup } from "../components/data-manager/confirmation-popup";
import { MiaTitle } from "../components/data-manager/mia-title";
import { Page } from "../components/data-manager/page";
import {
  PageSection,
  PageSectionIconButton,
  PaddedPageSectionIconButton,
} from "../components/data-manager/page-section";
import { ProjectCreationPopup } from "../components/data-manager/project-creation-popup";
import { ProjectList } from "../components/data-manager/projects-list/project-list";
import {
  useCreateProjectMutation,
  useDeleteProjectsMutation,
  useProjects,
} from "../queries";
import { Project } from "../types";
import { useNavigate } from "react-router-dom";
import useLocalStorageToggle from "../components/data-manager/util/use-local-storage";
import { GridView } from "../components/data-manager/views/grid-view";
import { ListView } from "../components/data-manager/views/list-view";

const StyledSheet = styled(Sheet)`
  padding: ${space("listPadding")};
  box-sizing: border-box;
`;

const PlusIconButton = styled(PageSectionIconButton)`
  padding: 0 8px;
  height: auto;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
`;

export const ProjectsScreen: React.FC = observer(() => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  const { projects, projectsError, isErrorProjects, isLoadingProjects } =
    useProjects();
  const [projectToBeDeleted, setProjectToBeDeleted] = useState<Project>();
  const { deleteProjects } = useDeleteProjectsMutation();
  const { createProject } = useCreateProjectMutation();

  // Delete Project Confirmation
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

  // Create Project
  const [isCreateProjectPopupOpen, setIsCreateProjectPopupOpen] =
    useState(false);
  const openCreateProjectPopup = useCallback(
    () => setIsCreateProjectPopupOpen(true),
    [],
  );
  const closeCreateProjectPopup = useCallback(
    () => setIsCreateProjectPopupOpen(false),
    [],
  );

  // Delete Project
  const deleteProject = useCallback(
    (project: Project) => {
      setProjectToBeDeleted(project);
      openDeleteProjectConfirmationPopUp();
    },
    [setProjectToBeDeleted, openDeleteProjectConfirmationPopUp],
  );

  // Open Project
  const openProject = useCallback(
    (project: Project) => {
      navigate(`/projects/${project.id}`);
    },
    [navigate],
  );

  const confirmDeleteProject = useCallback(() => {
    if (projectToBeDeleted)
      deleteProjects({
        projectIds: [projectToBeDeleted.id],
      });
  }, [deleteProjects, projectToBeDeleted]);

  // Switch between List and Grid View
  const [isGridView, setIsGridView] = useLocalStorageToggle(
    "isGridViewProjects",
    true,
  );
  const toggleGridView = useCallback(() => {
    setIsGridView((prev: boolean) => !prev);
  }, [setIsGridView]);

  let projectsInfoTx;
  if (projectsError) projectsInfoTx = "projects-loading-failed";
  else if (projects && projects.length === 0)
    projectsInfoTx = "no-projects-available";

  return (
    <Screen
      title={`${translate("projects-base-title")} ${
        isLoadingProjects
          ? translate("loading")
          : isErrorProjects
          ? translate("error")
          : ""
      }`}
    >
      <Page>
        <MiaTitle />
        <PageSection
          titleTx="projects"
          infoTx={projectsInfoTx}
          showActions={!projectsError}
          isLoading={isLoadingProjects}
          actions={
            <Container>
              <PaddedPageSectionIconButton
                icon="plus"
                tooltipTx="create-project"
                tooltipPosition="left"
                onPointerDown={openCreateProjectPopup}
              />
              <PaddedPageSectionIconButton
                icon={isGridView ? "list" : "grid"}
                tooltipTx={isGridView ? "switch-to-list" : "switch-to-grid"}
                tooltipPosition="right"
                onPointerDown={toggleGridView}
              />
            </Container>
          }
        >
          <StyledSheet>
            {projects &&
              (isGridView ? (
                <GridView
                  data={projects}
                  onDelete={deleteProject}
                  onClick={openProject}
                />
              ) : (
                <ListView
                  data={projects}
                  onDelete={deleteProject}
                  onClick={openProject}
                />
              ))}
          </StyledSheet>
          <ConfirmationPopup
            isOpen={isDeleteProjectConfirmationPopUpOpen}
            onClose={closeDeleteProjectConfirmationPopUp}
            message={translate("delete-project-message", {
              name: projectToBeDeleted?.name ?? "",
            })}
            titleTx="delete-project-title"
            onConfirm={confirmDeleteProject}
          />
          <ProjectCreationPopup
            isOpen={isCreateProjectPopupOpen}
            onClose={closeCreateProjectPopup}
            onConfirm={createProject}
          />
        </PageSection>
      </Page>
    </Screen>
  );
});

export default ProjectsScreen;
