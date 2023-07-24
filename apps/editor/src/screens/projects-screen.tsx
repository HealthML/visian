import { Screen, useTranslation } from "@visian/ui-shared";
import { Project } from "@visian/mia-api";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { ConfirmationPopup } from "../components/data-manager/confirmation-popup";
import { EditPopup } from "../components/data-manager/edit-popup";
import { MiaTitle } from "../components/data-manager/mia-title";
import { Page } from "../components/data-manager/page";
import {
  PaddedPageSectionIconButton,
  PageSection,
} from "../components/data-manager/page-section";
import { ProjectCreationPopup } from "../components/data-manager/project-creation-popup";
import useLocalStorageToggle from "../components/data-manager/util/use-local-storage";
import { GridView } from "../components/data-manager/views/grid-view";
import { ListView } from "../components/data-manager/views/list-view";
import {
  createProjectMutation,
  deleteProjectsMutation,
  updateProjectMutation,
  useProjects,
} from "../queries";

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const StyledIconButton = styled(PaddedPageSectionIconButton)`
  padding: 0 9px;
  height: 25px;
`;

export const ProjectsScreen: React.FC = observer(() => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  const {
    data: projects,
    error: projectsError,
    isError: isErrorProjects,
    isLoading: isLoadingProjects,
  } = useProjects();
  const [projectToBeDeleted, setProjectToBeDeleted] = useState<Project>();
  const [projectToBeUpdated, setProjectToBeUpdated] = useState<Project>();
  const { mutate: createProject } = createProjectMutation();
  const { mutate: deleteMutateProjects } = deleteProjectsMutation();
  const { mutate: updateProject } = updateProjectMutation();

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

  // Edit Project
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const openEditPopup = useCallback(() => setIsEditPopupOpen(true), []);
  const closeEditPopup = useCallback(() => setIsEditPopupOpen(false), []);

  const editProject = useCallback(
    (project: Project) => {
      setProjectToBeUpdated(project);
      openEditPopup();
    },
    [setProjectToBeUpdated, openEditPopup],
  );

  const confirmDeleteProject = useCallback(() => {
    if (projectToBeDeleted)
      deleteMutateProjects({
        objectIds: [projectToBeDeleted.id],
        selectorId: "",
      });
  }, [deleteMutateProjects, projectToBeDeleted]);

  const confirmCreateProject = useCallback(
    (newName: string) =>
      createProject({
        createDto: { name: newName },
        selectorId: "",
      }),
    [createProject],
  );

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
              <StyledIconButton
                icon={isGridView ? "list" : "grid"}
                tooltipTx={isGridView ? "switch-to-list" : "switch-to-grid"}
                tooltipPosition="right"
                onPointerDown={toggleGridView}
              />
              <StyledIconButton
                icon="plus"
                tooltipTx="create-project"
                tooltipPosition="left"
                onPointerDown={openCreateProjectPopup}
              />
            </Container>
          }
        >
          {projects &&
            (isGridView ? (
              <GridView
                data={projects}
                onDelete={deleteProject}
                onClick={openProject}
                onEdit={editProject}
              />
            ) : (
              <ListView
                data={projects}
                onDelete={deleteProject}
                onClick={openProject}
                onEdit={editProject}
              />
            ))}
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
            onConfirm={confirmCreateProject}
          />
          {projectToBeUpdated && (
            <EditPopup
              oldName={projectToBeUpdated.name}
              isOpen={isEditPopupOpen}
              onClose={closeEditPopup}
              onConfirm={(newName) =>
                updateProject({
                  object: projectToBeUpdated,
                  updateDto: { name: newName },
                  selectorId: "",
                })
              }
            />
          )}
        </PageSection>
      </Page>
    </Screen>
  );
});

export default ProjectsScreen;
