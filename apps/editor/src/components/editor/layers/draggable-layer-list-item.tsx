import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ILayer } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";

import { LayerListItem } from "./layer-list-item";

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragged ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LayerListItem layer={layer} isActive={isActive} isLast={isLast} />
    </div>
  );
});
