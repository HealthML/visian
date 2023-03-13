import { Screen, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";

import { DatasetsGrid } from "../components/menu/datasets-grid";
import UIOverlayMenu from "../components/menu/ui-overlay-menu/ui-overlay-menu";
import { useProject } from "../queries";

export const ProjectDatasetsScreen: React.FC = observer(() => {
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
      <UIOverlayMenu
        backButton
        editButton
        projectViewSwitch
        defaultSwitchSelection="datasets"
        main={projectId && <DatasetsGrid projectId={projectId} />}
      />
    </Screen>
  );
});

export default ProjectDatasetsScreen;
