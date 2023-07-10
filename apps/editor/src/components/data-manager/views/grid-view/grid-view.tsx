import {
  Grid,
  MiaIterableData,
  space,
  stopPropagation,
} from "@visian/ui-shared";
import styled from "styled-components";

import { GridViewItem } from "./grid-view-item";
import { GridViewProps } from "./grid-view.props";

const StyledGrid = styled(Grid)`
  width: 100%;
  overflow-y: auto;
  user-select: none;
  gap: ${space("pageSectionMargin")};
`;

export const GridView = <T extends MiaIterableData>({
  data,
  imgSrc,
  onDelete,
  onClick,
  onEdit,
}: GridViewProps<T>) => (
  <StyledGrid onWheel={stopPropagation}>
    {data.map((item) => (
      <GridViewItem
        item={item}
        key={item.id}
        imgSrc={imgSrc}
        onDelete={() => onDelete(item)}
        onClick={() => {
          onClick(item);
        }}
        onEdit={() => onEdit(item)}
      />
    ))}
  </StyledGrid>
);
