import { Modal, Screen, Text, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
import { Outlet, useParams } from "react-router-dom";
import styled from "styled-components";

import { ProjectViewSwitch } from "../components/data-manager/project-view-switch";
import { UIOverlayDataManager } from "../components/data-manager/ui-overlay-data-manager";
import { useProject } from "../queries";

const StyledModal = styled(Modal)`
  width: 100%;
`;

const ErrorMessage = styled(Text)`
  margin: auto;
`;

export const ProjectScreen: React.FC = observer(() => {
  const projectId = useParams().projectId || "";
  const { project, projectError, isErrorProject, isLoadingProject } =
    useProject(projectId);
  const { t: translate } = useTranslation();

  const altMessage = useMemo(() => {
    if (isLoadingProject) return translate("project-loading");
    if (isErrorProject)
      return `${translate("project-loading-error")} ${
        projectError?.response?.statusText
      } (${projectError?.response?.status})`;
    return null;
  }, [isLoadingProject, isErrorProject, projectError, translate]);

  return (
    <Screen
      title={`${translate("project-base-title")} ${
        isLoadingProject
          ? translate("loading")
          : isErrorProject
          ? translate("error")
          : project
          ? project.name
          : ""
      }`}
    >
      <UIOverlayDataManager
        homeButton
        topCenter={<ProjectViewSwitch />}
        main={
          altMessage ? (
            <StyledModal>
              <ErrorMessage tx={altMessage} />
            </StyledModal>
          ) : (
            <Outlet />
          )
        }
      />
    </Screen>
  );
});

export default ProjectScreen;
