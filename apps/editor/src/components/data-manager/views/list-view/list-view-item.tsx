import { ListItem, OptionSelector, Text } from "@visian/ui-shared";
import { MiaIterableData } from "@visian/utils";
import styled from "styled-components";

const ExpandedSpacer = styled.div`
  margin-right: auto;
`;

const ClickableListItem = styled(ListItem)`
  cursor: pointer;
`;

const StyledText = styled(Text)`
  width: 95%;
`;

export const ListViewItem = ({
  item,
  onDelete,
  onClick,
  onEdit,
  isLast,
}: {
  item: MiaIterableData;
  onDelete: () => void;
  onClick: () => void;
  onEdit: () => void;
  isLast: boolean;
}) => (
  <ClickableListItem onClick={onClick} isLast={isLast}>
    <StyledText title={item.name} text={item.name} />
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
