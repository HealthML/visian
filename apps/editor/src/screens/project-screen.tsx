import { Screen, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { Outlet, useParams } from "react-router-dom";

import { ProjectViewSwitch } from "../components/menu/project-view-switch";
import { UIOverlayDataManager } from "../components/menu/ui-overlay-data-manager";
import { useProject } from "../queries";

export const ProjectScreen: React.FC = observer(() => {
  const projectId = useParams().projectId || "";
  const { project, isErrorProject, isLoadingProject } = useProject(projectId);
  const { t: translate } = useTranslation();

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
        main={<Outlet />}
      />
    </Screen>
  );
});

export default ProjectScreen;
