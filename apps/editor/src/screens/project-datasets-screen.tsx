import { Screen, Text, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";

import { DatasetsGrid } from "../components/menu/datasets-grid";
import { UIOverlayMenu } from "../components/menu/ui-overlay-menu";
import { useDatasetsBy, useProject } from "../queries";

export const ProjectDatasetsScreen: React.FC = observer(() => {
  const projectId = useParams().projectId || "";
  const { project, projectError, isErrorProject, isLoadingProject } =
    useProject(projectId);
  const { datasets, datasetsError, isErrorDatasets, isLoadingDatasets } =
    useDatasetsBy(projectId);
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
        main={
          isLoadingProject || isLoadingDatasets ? (
            <Text>{translate("datasets-loading")}</Text>
          ) : isErrorProject ? (
            <Text>{`${translate("error")} ${
              projectError?.response?.statusText
            } (${projectError?.response?.status})`}</Text>
          ) : isErrorDatasets ? (
            <Text>{`${translate("datasets-loading-error")} ${
              datasetsError?.response?.statusText
            } (${datasetsError?.response?.status})`}</Text>
          ) : datasets && datasets.length > 0 ? (
            <DatasetsGrid projectId={projectId} />
          ) : (
            <Text>{translate("no-datasets-available")}</Text>
          )
        }
      />
    </Screen>
  );
});

export default ProjectDatasetsScreen;
