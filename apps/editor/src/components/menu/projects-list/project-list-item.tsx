import { FlexRow, ListItem, Text } from "@visian/ui-shared";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { Project } from "../../../types";

const Spacer = styled.div`
  width: 10px;
`;

const ModelFlexRow = styled(FlexRow)`
  margin-right: auto;
  cursor: pointer;
`;

export const ProjectListItem = ({ project }: { project: Project }) => {
  const navigate = useNavigate();

  return (
    <ListItem>
      <ModelFlexRow
        onClick={() => navigate(`/projects/${project.id}/datasets`)}
      >
        <Text>{project.name} </Text>
        <Spacer />
      </ModelFlexRow>
    </ListItem>
  );
};

export default ProjectListItem;
