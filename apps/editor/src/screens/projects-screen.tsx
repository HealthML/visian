import { Screen, Text, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";

import { ProjectList } from "../components/menu/projects-list/project-list";
import { UIOverlayMenu } from "../components/menu/ui-overlay-menu";
import { useProjects } from "../queries";

export const ProjectsScreen: React.FC = observer(() => {
  const { projects, projectsError, isErrorProjects, isLoadingProjects } =
    useProjects();
  const { t: translate } = useTranslation();

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
      <UIOverlayMenu
        main={
          isLoadingProjects ? (
            <Text>{translate("projects-loading")}</Text>
          ) : isErrorProjects ? (
            <Text>{`${translate("projects-loading-error")} ${
              projectsError?.response?.statusText
            } (${projectsError?.response?.status})`}</Text>
          ) : projects && projects.length > 0 ? (
            <ProjectList projects={projects} />
          ) : (
            <Text>{translate("no-projects-available")}</Text>
          )
        }
      />
    </Screen>
  );
});

export default ProjectsScreen;
