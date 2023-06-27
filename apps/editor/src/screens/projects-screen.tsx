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
} from "../components/data-manager/page-section";
import { ProjectCreationPopup } from "../components/data-manager/project-creation-popup";
import { ProjectList } from "../components/data-manager/projects-list/project-list";
import {
  useCreateProjectMutation,
  useDeleteProjectsMutation,
  useProjects,
} from "../queries";
import { Project } from "../types";

const StyledSheet = styled(Sheet)`
  padding: ${space("listPadding")};
  box-sizing: border-box;
`;

const PlusIconButton = styled(PageSectionIconButton)`
  padding: 0 8px;
  height: auto;
`;

export const ProjectsScreen: React.FC = observer(() => {
  const { projects, projectsError, isErrorProjects, isLoadingProjects } =
    useProjects();
  const [projectToBeDeleted, setProjectToBeDeleted] = useState<Project>();
  const { deleteProjects } = useDeleteProjectsMutation();
  const { createProject } = useCreateProjectMutation();
  const { t: translate } = useTranslation();

  // delete project confirmation popup
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

  // create project popup
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

  const deleteProject = useCallback(
    (project: Project) => {
      setProjectToBeDeleted(project);
      openDeleteProjectConfirmationPopUp();
    },
    [setProjectToBeDeleted, openDeleteProjectConfirmationPopUp],
  );

  const confirmDeleteProject = useCallback(() => {
    if (projectToBeDeleted)
      deleteProjects({
        projectIds: [projectToBeDeleted.id],
      });
  }, [deleteProjects, projectToBeDeleted]);

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
            <PlusIconButton
              icon="plus"
              tooltipTx="create-project"
              tooltipPosition="left"
              onPointerDown={openCreateProjectPopup}
            />
          }
        >
          <StyledSheet>
            {projects && (
              <ProjectList projects={projects} deleteProject={deleteProject} />
            )}
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
