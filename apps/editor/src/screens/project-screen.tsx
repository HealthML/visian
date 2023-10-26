import { Screen, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";

import {
  DatasetsSection,
  JobsSection,
  Page,
  PageError,
  PageLoadingBlock,
  PageTitle,
} from "../components";
import { useProject } from "../queries";

export const ProjectScreen: React.FC = observer(() => {
  const projectId = useParams().projectId || "";
  const { project, isErrorProject, isLoadingProject } = useProject(projectId);
  const { t: translate } = useTranslation();

  let pageContent = <PageLoadingBlock labelTx="project" backPath="/projects" />;

  if (isErrorProject) {
    pageContent = (
      <PageError backPath="/projects" errorTx="project-loading-failed" />
    );
  } else if (project) {
    pageContent = (
      <>
        <PageTitle
          title={project.name}
          labelTx="project"
          backPath="/projects"
        />
        <DatasetsSection project={project} />
        <JobsSection project={project} />
      </>
    );
  }

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
      <Page>{pageContent}</Page>
    </Screen>
  );
});

export default ProjectScreen;
