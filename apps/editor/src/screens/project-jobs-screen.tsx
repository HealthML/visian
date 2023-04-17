import { Screen, Text, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";

import { JobHistory } from "../components/menu/job-history";
import { UIOverlayMenu } from "../components/menu/ui-overlay-menu";
import { useProject } from "../queries";
import useJobsBy from "../queries/use-jobs-by";

export const ProjectJobsScreen: React.FC = observer(() => {
  const projectId = useParams().projectId || "";
  const { project, projectError, isErrorProject, isLoadingProject } =
    useProject(projectId);
  const { jobs, jobsError, isErrorJobs, isLoadingJobs } = useJobsBy(projectId);
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
        homeButton
        projectViewSwitch
        defaultSwitchSelection="jobs"
        main={
          isLoadingProject || isLoadingJobs ? (
            <Text>{translate("datasets-loading")}</Text>
          ) : isErrorProject ? (
            <Text>{`${translate("error")} ${
              projectError?.response?.statusText
            } (${projectError?.response?.status})`}</Text>
          ) : isErrorJobs ? (
            <Text>{`${translate("datasets-loading-error")} ${
              jobsError?.response?.statusText
            } (${jobsError?.response?.status})`}</Text>
          ) : jobs && jobs.length > 0 ? (
            <JobHistory projectId={projectId} />
          ) : (
            <Text>{translate("no-datasets-available")}</Text>
          )
        }
      />
    </Screen>
  );
});

export default ProjectJobsScreen;
