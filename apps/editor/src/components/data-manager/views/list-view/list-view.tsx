import { IterableData, List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { SectionSheet } from "../../page-section";
import { ListViewItem } from "./list-view-item";
import { ListViewProps } from "./list-view.props";

const StyledList = styled(List)`
  width: 100%;
  overflow-y: auto;
  user-select: none;
`;

export const ListView = <T extends IterableData>({
  data,
  onDelete,
  onClick,
  onEdit,
}: ListViewProps<T>) => (
  <SectionSheet>
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
          onEdit={() => onEdit(item)}
        />
      ))}
    </StyledList>
  </SectionSheet>
);
