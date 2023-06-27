import { Grid, space, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { IterableData } from "../../../../types";
import { GridViewItem } from "./grid-view-item";
import { GridViewProps } from "./grid-view.props";

const StyledGrid = styled(Grid)`
  width: 100%;
  overflow-y: auto;
  user-select: none;
  gap: ${space("pageSectionMarginSmall")};
`;

export const GridView = <T extends IterableData>({
  data,
  imgSrc,
  onDelete,
  onClick,
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
      />
    ))}
  </StyledGrid>
);
