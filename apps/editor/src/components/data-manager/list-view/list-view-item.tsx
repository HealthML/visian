import { InvisibleButton, ListItem, Text } from "@visian/ui-shared";
import styled from "styled-components";

import { Dataset, Project } from "../../../types";

const ExpandedSpacer = styled.div`
  margin-right: auto;
`;

const IconButton = styled(InvisibleButton)`
  width: 30px;
`;

const ClickableListItem = styled(ListItem)`
  cursor: pointer;
`;

export const ListViewItem = ({
  item,
  onDelete,
  onClick,
  isLast,
}: {
  item: Project | Dataset;
  onDelete: () => void;
  onClick: () => void;
  isLast: boolean;
}) => (
  <ClickableListItem isLast={isLast} onClick={onClick}>
    <Text onClick={onClick}>{item.name}</Text>
    <ExpandedSpacer />
    <IconButton
      icon="trash"
      tooltipTx="delete"
      onPointerDown={onDelete}
      style={{ marginLeft: "auto" }}
      tooltipPosition="left"
    />
  </ClickableListItem>
);

export default ListViewItem;
