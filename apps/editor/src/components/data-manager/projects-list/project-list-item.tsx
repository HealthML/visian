import {
  InvisibleButton,
  ListItem,
  OptionSelector,
  Text,
} from "@visian/ui-shared";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { Project } from "../../../types";

const ExpandedSpacer = styled.div`
  margin-right: auto;
`;

const ClickableText = styled(Text)`
  cursor: pointer;
`;

export const ProjectListItem = ({
  project,
  deleteProject,
  isLast,
}: {
  project: Project;
  deleteProject: () => void;
  isLast: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <ListItem isLast={isLast}>
      <ClickableText
        onClick={() => navigate(`/projects/${project.id}/datasets`)}
      >
        {project.name}
      </ClickableText>
      <ExpandedSpacer />
      <OptionSelector
        options={[
          {
            value: "delete",
            labelTx: "delete",
            icon: "trash",
            iconSize: 30,
          },
          {
            value: "edit",
            label: "Edit",
            icon: "plus",
          },
        ]}
        onOptionSelected={(value) => console.log(value)}
      />
    </ListItem>
  );
};

export default ProjectListItem;
