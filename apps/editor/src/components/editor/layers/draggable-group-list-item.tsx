import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IAnnotationGroup, ILayer } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";

import { AnnotationGroupListItem } from "./group-list-item";

export const DraggableAnnotationGroupListItem = observer<{
  group: IAnnotationGroup;
  isActive: boolean;
  isLast?: boolean;
  isDragged?: boolean;
  draggedLayer?: ILayer;
}>(({ group, isActive, isLast, isDragged, draggedLayer }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: group.id, data: { annotationGroup: group } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragged ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AnnotationGroupListItem
        group={group}
        isActive={isActive}
        isLast={isLast}
        draggedLayer={draggedLayer}
      />
    </div>
  );
});
