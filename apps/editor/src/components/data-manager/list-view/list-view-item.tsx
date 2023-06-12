import { InvisibleButton, ListItem, Text } from "@visian/ui-shared";
import styled from "styled-components";

import { Dataset, Project } from "../../../types";

const ExpandedSpacer = styled.div`
  margin-right: auto;
`;

const IconButton = styled(InvisibleButton)`
  width: 30px;
`;

const ClickableText = styled(Text)`
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
  <ListItem isLast={isLast}>
    <ClickableText onClick={onClick}>{item.name}</ClickableText>
    <ExpandedSpacer />
    <IconButton
      icon="trash"
      tooltipTx="delete"
      onPointerDown={onDelete}
      style={{ marginLeft: "auto" }}
      tooltipPosition="left"
    />
  </ListItem>
);

export default ListViewItem;
