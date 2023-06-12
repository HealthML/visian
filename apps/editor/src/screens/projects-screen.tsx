import {
  Modal,
  Screen,
  SquareButton,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { ConfirmationPopup } from "../components/data-manager/confirmation-popup";
import { ProjectCreationPopup } from "../components/data-manager/project-creation-popup";
import { ProjectList } from "../components/data-manager/projects-list/project-list";
import { UIOverlayDataManager } from "../components/data-manager/ui-overlay-data-manager";
import {
  useCreateProjectMutation,
  useDeleteProjectsMutation,
  useProjects,
} from "../queries";
import { Project } from "../types";

const StyledModal = styled(Modal)`
  width: 100%;
`;

const ErrorMessage = styled(Text)`
  margin: auto;
`;

const StyledButton = styled(SquareButton)`
  margin-left: 10px;
  padding: 10px;
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
      translate("delete-project-message", {
        name: projectTobBeDeleted?.name ?? "",
      }),
    [projectTobBeDeleted, translate],
  );

  const altMessage = useMemo(() => {
    if (isLoadingProjects) return translate("projects-loading");
    if (isErrorProjects)
      return `${translate("projects-loading-error")} ${
        projectsError?.response?.statusText
      } (${projectsError?.response?.status})`;
    if (projects && projects.length <= 0)
      return translate("no-projects-available");
    return null;
  }, [isLoadingProjects, isErrorProjects, projects, projectsError, translate]);

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
          <StyledModal
            hideHeaderDivider={false}
            labelTx="projects-base-title"
            position="right"
            headerChildren={
              <StyledButton
                icon="plus"
                tooltipTx="create-project"
                tooltipPosition="left"
                onPointerDown={openCreateProjectPopup}
              />
            }
          >
            {altMessage ? (
              <ErrorMessage tx={altMessage} />
            ) : (
              projects && (
                <ProjectList
                  projects={projects}
                  deleteProject={deleteProject}
                />
              )
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
        }
      />
    </Screen>
  );
});

export default ProjectsScreen;
