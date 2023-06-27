import { ListItem, OptionSelector, Text } from "@visian/ui-shared";
import styled from "styled-components";

import { IterableData } from "../../../../types";

const ExpandedSpacer = styled.div`
  margin-right: auto;
`;

const ClickableListItem = styled(ListItem)`
  cursor: pointer;
`;

export const ListViewItem = ({
  item,
  onDelete,
  onClick,
  onEdit,
  isLast,
}: {
  item: IterableData;
  onDelete: () => void;
  onClick: () => void;
  onEdit: () => void;
  isLast: boolean;
}) => (
  <ClickableListItem isLast={isLast}>
    <Text onClick={onClick}>{item.name}</Text>
    <ExpandedSpacer />
    <OptionSelector
      options={[
        {
          value: "delete",
          labelTx: "delete",
          icon: "trash",
          iconSize: 30,
          onSelected: onDelete,
        },
        {
          value: "edit",
          label: "Edit",
          icon: "pixelBrush",
          iconSize: 30,
          onSelected: onEdit,
        },
      ]}
      pannelPosition="bottom"
    />
  </ClickableListItem>
);

export default ListViewItem;
