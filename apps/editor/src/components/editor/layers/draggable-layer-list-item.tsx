import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ILayer } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

import { LayerListItem } from "./layer-list-item";

const DraggableDiv = styled.div<{
  opacity: number;
  transform: string | undefined;
  transition: string | undefined;
}>`
  opacity: ${({ opacity }) => opacity};
  transform: ${({ transform }) => transform};
  transition: ${({ transition }) => transition};
`;

export const DraggableLayerListItem = observer<{
  layer: ILayer;
  isActive?: boolean;
  isLast?: boolean;
  isDragged?: boolean;
}>(({ layer, isActive, isLast, isDragged }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: layer.id,
      data: { layer },
    });

  return (
    <DraggableDiv
      ref={setNodeRef}
      transform={CSS.Transform.toString(transform)}
      transition={transition}
      opacity={isDragged ? 0.3 : 1}
      {...attributes}
      {...listeners}
    >
      <LayerListItem layer={layer} isActive={isActive} isLast={isLast} />
    </DraggableDiv>
  );
});
