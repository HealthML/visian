import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IAnnotationGroup, ILayer } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

import { AnnotationGroupListItem } from "./group-list-item";

const DraggableDiv = styled.div<{
  opacity: number;
  transform: string | undefined;
  transition: string | undefined;
}>`
  opacity: ${({ opacity }) => opacity};
  transform: ${({ transform }) => transform};
  transition: ${({ transition }) => transition};
`;

export const DraggableAnnotationGroupListItem = observer<{
  group: IAnnotationGroup;
  isActive: boolean;
  isLast?: boolean;
  isDragged?: boolean;
  draggedLayer?: ILayer;
}>(({ group, isActive, isLast, isDragged, draggedLayer }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: group.id, data: { annotationGroup: group } });

  return (
    <DraggableDiv
      ref={setNodeRef}
      transform={CSS.Transform.toString(transform)}
      transition={transition}
      opacity={isDragged ? 0.3 : 1}
      {...attributes}
      {...listeners}
    >
      <AnnotationGroupListItem
        group={group}
        isActive={isActive}
        isLast={isLast}
        draggedLayer={draggedLayer}
      />
    </DraggableDiv>
  );
});
