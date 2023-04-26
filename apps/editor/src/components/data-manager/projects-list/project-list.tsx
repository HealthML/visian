import { List, Modal, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Project } from "../../../types";
import { ProjectListItem } from "./project-list-item";

const StyledModal = styled(Modal)`
  width: 100vw;
`;

const StyledProjectList = styled(List)`
  overflow-y: auto;
`;

export const ProjectList = ({ projects }: { projects: Project[] }) => (
  <StyledModal>
    <StyledProjectList onWheel={stopPropagation}>
      {projects.map((project: Project) => (
        <ProjectListItem project={project} />
      ))}
    </StyledProjectList>
  </StyledModal>
);
