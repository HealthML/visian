import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Project } from "../../../types";
import { ProjectListItem } from "./project-list-item";

const StyledProjectList = styled(List)`
  width: 100%;
  height: 400px;
  overflow-y: auto;
`;

export const ProjectList = ({ projects }: { projects: Project[] }) => (
  <StyledProjectList onWheel={stopPropagation}>
    {projects.map((project: Project) => (
      <ProjectListItem project={project} />
    ))}
  </StyledProjectList>
);
