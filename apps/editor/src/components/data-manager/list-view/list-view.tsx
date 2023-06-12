import { List, stopPropagation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

import { ListViewItem } from "./list-view-item";
import { ListViewProps } from "./list-view.props";

const StyledList = styled(List)`
  width: 100%;
  overflow-y: auto;
  user-select: none;
`;

export const ListView = observer<ListViewProps>(
  ({ data, onDelete, onClick }: ListViewProps) => (
    <StyledList onWheel={stopPropagation}>
      {data.map((item, index) => (
        <ListViewItem
          item={item}
          isLast={index === data.length - 1}
          key={item.id}
          onDelete={() => onDelete(item)}
          onClick={() => {
            onClick(item);
          }}
        />
      ))}
    </StyledList>
  ),
);
