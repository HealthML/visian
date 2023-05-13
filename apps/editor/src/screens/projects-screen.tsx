import {
  InvisibleButton,
  Modal,
  Screen,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { ConfirmationPopup } from "../components/menu/confirmation-popup";
import { ProjectCreationPopup } from "../components/menu/project-creation-popup";
import { ProjectList } from "../components/menu/projects-list/project-list";
import { UIOverlayDataManager } from "../components/menu/ui-overlay-data-manager";
import {
  useCreateProjectMutation,
  useDeleteProjectsMutation,
  useProjects,
} from "../queries";
import { Project } from "../types";

const StyledModal = styled(Modal)`
  width: 100%;
`;

const IconButton = styled(InvisibleButton)`
  width: 30px;
`;

export const ProjectsScreen: React.FC = observer(() => {
  const { projects, projectsError, isErrorProjects, isLoadingProjects } =
    useProjects();
  const [projectTobBeDeleted, setProjectTobBeDeleted] = useState<Project>();
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
    <Screen
      title={`${translate("projects-base-title")} ${
        isLoadingProjects
          ? translate("loading")
          : isErrorProjects
          ? translate("error")
          : ""
      }`}
    >
      <UIOverlayDataManager
        main={
          isLoadingProjects ? (
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
              headerChildren={
                <IconButton
                  icon="plus"
                  tooltipTx="create-project"
                  tooltipPosition="left"
                  onPointerDown={openCreateProjectPopup}
                />
              }
            >
              {projects && projects.length > 0 ? (
                <ProjectList
                  projects={projects}
                  deleteProject={deleteProject}
                />
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
              <ProjectCreationPopup
                isOpen={isCreateProjectPopupOpen}
                onClose={closeCreateProjectPopup}
                onConfirm={(newProjectDto) => createProject(newProjectDto)}
              />
            </StyledModal>
          )
        }
      />
    </Screen>
  );
});

export default ProjectsScreen;
