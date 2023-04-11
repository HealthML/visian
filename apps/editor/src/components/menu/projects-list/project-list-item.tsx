import { InvisibleButton, ListItem, Text } from "@visian/ui-shared";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { Project } from "../../../types";

const ExpandedSpacer = styled.div`
  margin-right: auto;
`;

const IconButton = styled(InvisibleButton)`
  width: 30px;
`;

const ClickableText = styled(Text)`
  cursor: pointer;
`;

export const ProjectListItem = ({
  project,
  enableControls,
  deleteProject,
}: {
  project: Project;
  enableControls: boolean;
  deleteProject: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <ListItem>
      <ClickableText
        onClick={() => navigate(`/projects/${project.id}/datasets`)}
      >
        {project.name}
      </ClickableText>
      <ExpandedSpacer />
      {enableControls && (
        <IconButton
          icon="trash"
          tooltipTx="delete-project-title"
          onPointerDown={deleteProject}
          style={{ marginLeft: "auto" }}
          tooltipPosition="left"
        />
      )}
    </ListItem>
  );
};

export default ProjectListItem;
