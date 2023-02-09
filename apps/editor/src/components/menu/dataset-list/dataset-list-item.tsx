import { ListItem, Text } from "@visian/ui-shared";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { Dataset } from "../../../types";

const StyledListItem = styled(ListItem)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 400px;
  height: 200px;
  background-color: lightgray;
  border-radius: 5%;
  cursor: pointer;

  @media (max-width: 800px) {
    width: 200px;
    height: 100px;
  }
`;

const StyledText = styled(Text)`
  font-size: 16px;
  color: black;
`;

export const DatasetListItem = ({ dataset }: { dataset: Dataset }) => {
  const navigate = useNavigate();

  return (
    <StyledListItem
      onClick={() => navigate(`/project/${dataset.project}/${dataset.id}`)}
    >
      <StyledText>{dataset.name}</StyledText>
    </StyledListItem>
  );
};

export default DatasetListItem;
