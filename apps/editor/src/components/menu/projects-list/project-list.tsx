import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Project } from "../../../types";
import { ProjectListItem } from "./project-list-item";

const StyledProjectList = styled(List)`
  width: 100%;
  overflow-y: auto;
  user-select: none;
`;

export const ProjectList = ({
  projects,
  deleteProject,
}: {
  projects: Project[];
  deleteProject: (project: Project) => void;
}) => (
  <StyledProjectList onWheel={stopPropagation}>
    {projects.map((project: Project) => (
      <ProjectListItem
        project={project}
        key={project.id}
        deleteProject={() => deleteProject(project)}
      />
    ))}
  </StyledProjectList>
);
