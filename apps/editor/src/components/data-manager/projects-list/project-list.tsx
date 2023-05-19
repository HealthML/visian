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
    {projects.map((project: Project, index) => (
      <ProjectListItem
        project={project}
        isLast={index === projects.length - 1}
        key={project.id}
        deleteProject={() => deleteProject(project)}
      />
    ))}
  </StyledProjectList>
);
