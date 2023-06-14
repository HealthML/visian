import { Screen, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";

import { Navbar } from "../components/data-manager/navbar";
import { Page } from "../components/data-manager/page";
import { PageError } from "../components/data-manager/page-error";
import { PageLoadingBlock } from "../components/data-manager/page-loading-block";
import { ProjectPage } from "../components/data-manager/project-page";
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
    pageContent = <ProjectPage project={project} />;
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
