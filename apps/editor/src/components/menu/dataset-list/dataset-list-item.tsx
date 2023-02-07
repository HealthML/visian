import { FlexRow, ListItem, Text } from "@visian/ui-shared";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import hubBaseUrl from "../../../queries/hub-base-url";
import { Dataset } from "../../../types";

const Spacer = styled.div`
  width: 10px;
`;

const ModelFlexRow = styled(FlexRow)`
  margin-right: auto;
  cursor: pointer;
`;

export const DatasetListItem = ({ dataset }: { dataset: Dataset }) => {
  const navigate = useNavigate();

  return (
    <ListItem>
      <ModelFlexRow
        onClick={() => navigate(`/project/${dataset.project}/${dataset.id}`)}
      >
        <Text>{dataset.name} </Text>
        <Spacer />
      </ModelFlexRow>
    </ListItem>
  );
};

export default DatasetListItem;
