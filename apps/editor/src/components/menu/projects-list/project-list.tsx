import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Project } from "../../../types";
import { ProjectListItem } from "./project-list-item";

const StyledProjectList = styled(List)`
  width: 100%;
  overflow-y: auto;
`;

export const ProjectList = ({
  projects,
  enableControls,
  deleteProject,
}: {
  projects: Project[];
  enableControls: boolean;
  deleteProject: (project: Project) => void;
}) => (
  <StyledProjectList onWheel={stopPropagation}>
    {projects.map((project: Project) => (
      <ProjectListItem
        project={project}
        enableControls={enableControls}
        deleteProject={() => deleteProject(project)}
      />
    ))}
  </StyledProjectList>
);
