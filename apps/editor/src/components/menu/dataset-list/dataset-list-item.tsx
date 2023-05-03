import { color, fontSize, fontWeight, ListItem, Text } from "@visian/ui-shared";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { Dataset } from "../../../types";

const StyledListItem = styled(ListItem)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 20vw;
  height: 15vw;
  background-color: ${color("sheet")};
  border-radius: 5%;
  cursor: pointer;
  position: relative;
`;

const StyledText = styled(Text)`
  font-size: ${fontSize("navigation")};
  font-weight: ${fontWeight("regular")};
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const DatasetListItem = ({ dataset }: { dataset: Dataset }) => {
  const navigate = useNavigate();

  return (
    <StyledListItem onClick={() => navigate(`/datasets/${dataset.id}`)} isLast>
      <StyledText>{dataset.name}</StyledText>
    </StyledListItem>
  );
};

export default DatasetListItem;
