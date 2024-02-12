import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FullWidthListItem, IAnnotationGroup, ILayer } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import styled from "styled-components";

import { DraggableLayerListItem } from "./draggable-layer-list-item";

const ChildLayerContainer = styled.div`
  margin-left: 16px;
`;

export const AnnotationGroupListItem = observer<{
  group: IAnnotationGroup;
  isActive: boolean;
  isLast?: boolean;
  draggedLayer?: ILayer;
}>(({ group, isActive, isLast, draggedLayer }) => {
  const toggleCollapse = useCallback(() => {
    group.setCollapsed(!group.collapsed);
  }, [group]);

  const hideDividerForLayer = useCallback(
    (layerIndex: number) => {
      if (isLast && layerIndex === group.layers.length - 1) return true;
      const indexOfActiveLayer = group.layers.findIndex((l) => l.isActive);
      return layerIndex === indexOfActiveLayer - 1;
    },
    [group, isLast],
  );

  return (
    <>
      <FullWidthListItem
        icon={group.collapsed ? "arrowRight" : "arrowDown"}
        onIconPress={toggleCollapse}
        labelTx={group.title}
        label={group.title}
        isActive={isActive}
        isLast={isLast && group.collapsed}
      />
      {!group.collapsed && (
        <ChildLayerContainer>
          <SortableContext
            items={group.layerIds}
            strategy={verticalListSortingStrategy}
          >
            {group.layers.map((layer, index) => (
              <DraggableLayerListItem
                key={layer.id}
                layer={layer}
                isActive={layer.isActive}
                isDragged={layer === draggedLayer}
                isLast={hideDividerForLayer(index)}
              />
            ))}
          </SortableContext>
        </ChildLayerContainer>
      )}
    </>
  );
});
